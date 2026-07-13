/**
 * 战斗系统 — 丧尸末日生存
 * d20 武器攻击、策略、战斗生成、回合结算
 */

import { itemDB } from '../../data/index.js'
import {
  randInt, chance, randomPick, randomSample, clamp,
  hasItemWithTag, calcDamage,
} from '../utils.js'
import {
  addToInventory, removeFromInventory, modifyStat, addJournalEntry,
} from '../state.js'

// ==================== 战斗策略 ====================

const combatStrategies = [
  {
    id: 'direct_attack',
    name: '⚔️ 正面强攻',
    desc: '不管三七二十一，正面硬刚！',
    defMod: 1.0,
    sanityCost: 0,
    sanityReq: 0,
    counterBonus: {} as Record<string, number>,
    highRisk: false,
  },
  {
    id: 'precise_strike',
    name: '🎯 精准打击',
    desc: '瞄准弱点攻击，对庞大/缓慢型敌人有奇效。',
    defMod: 1.0,
    sanityCost: 5,
    sanityReq: 30,
    counterBonus: { '庞大': 2, '缓慢': 2 },
    highRisk: false,
  },
  {
    id: 'defensive_stance',
    name: '🛡️ 防守反击',
    desc: '稳扎稳打，受到伤害减半。对快速/灵敏型敌人有优势。',
    defMod: 0.5,
    sanityCost: 0,
    sanityReq: 0,
    counterBonus: { '快速': 1, '灵敏': 1 },
    highRisk: false,
  },
  {
    id: 'find_weakness',
    name: '🔍 寻找弱点',
    desc: '仔细观察对手，寻找致命破绽。（骰 4+ 伤害翻倍）',
    defMod: 1.0,
    sanityCost: 8,
    sanityReq: 40,
    counterBonus: {} as Record<string, number>,
    highRisk: true,
  },
]

// ==================== 敌人描述 ====================

function getEnemyDescription(enemy) {
  const lines: string[] = []
  if (enemy.traits) {
    if (enemy.traits.includes('庞大')) lines.push('体型庞大，行动缓慢但皮糙肉厚')
    if (enemy.traits.includes('快速')) lines.push('身手敏捷，来去如风')
    if (enemy.traits.includes('灵敏')) lines.push('反应极快，难以命中')
    if (enemy.traits.includes('缓慢')) lines.push('动作迟缓，是个活靶子')
    if (enemy.traits.includes('隐蔽')) lines.push('善于潜伏，可能在你不注意时发动突袭')
    if (enemy.traits.includes('狡猾')) lines.push('诡计多端，不会傻傻地冲过来')
    if (enemy.traits.includes('自爆')) lines.push('腹部肿胀发光——千万不能让它近身！')
    if (enemy.traits.includes('重击')) lines.push('攻击力惊人，一不留神就可能受到重创')
    if (enemy.traits.includes('变异')) lines.push('它的身体已经发生了可怕的变异')
    if (enemy.traits.includes('飞行')) lines.push('它能在空中翱翔，地面上很难防范')
    if (enemy.traits.includes('集群')) lines.push('它们是成群行动的，数量会越来越多')
    if (enemy.traits.includes('毒气')) lines.push('死亡后可能释放致命毒气')
    if (enemy.traits.includes('再生')) lines.push('拥有惊人的自我愈合能力')
    if (enemy.traits.includes('人型')) lines.push('这是一个人——或者曾经是。比丧尸更加危险，因为它保留了人类的智慧')
    if (enemy.traits.includes('噪音')) lines.push('它发出的声音会吸引更多同伴')
    if (enemy.traits.includes('脆弱')) lines.push('身体脆弱，但也因此更加疯狂')
  }
  if (lines.length === 0) lines.push('一只普通的丧尸，但仍旧致命')
  return lines[Math.floor(Math.random() * lines.length)]
}

function getBestWeapon(state) {
  const weapons = state.inventory.filter(i => i.type === 'weapon')
  if (weapons.length === 0) return null
  weapons.sort((a, b) => (b.effects.damage || 0) - (a.effects.damage || 0))
  return weapons[0]
}

// ==================== 骰子系统 ====================

function d6() { return Math.floor(Math.random() * 6) + 1 }
function d20() { return Math.floor(Math.random() * 20) + 1 }

// ==================== 武器命中区间 ====================

function getHitRanges(wd: number): Array<{min: number, max: number, dmg: number}> {
  if (wd <= 3) return [{ min: 2, max: 7, dmg: 5 }, { min: 8, max: 16, dmg: 10 }, { min: 17, max: 19, dmg: 13 }]
  if (wd <= 5) return [{ min: 2, max: 6, dmg: 6 }, { min: 7, max: 16, dmg: 11 }, { min: 17, max: 19, dmg: 14 }]
  if (wd <= 7) return [{ min: 2, max: 5, dmg: 7 }, { min: 6, max: 15, dmg: 12 }, { min: 16, max: 19, dmg: 16 }]
  return [{ min: 2, max: 5, dmg: 8 }, { min: 6, max: 14, dmg: 13 }, { min: 15, max: 19, dmg: 17 }]
}

// ==================== 战斗策略获取 ====================

export function getCombatStrategies(state, enemy) {
  const r: any[] = []
  const weapons = state.inventory.filter(i => i.type === 'weapon')
  for (const w of randomSample(weapons, Math.min(2, weapons.length))) {
    if (w.effects.ammo && !hasItemWithTag(state.inventory, '弹药:' + w.effects.ammo)) continue
    const wd = w.effects.damage || 0
    const ranges = getHitRanges(wd)
    const rangeStr = '基础 4| ' + ranges.map(r => `<span class="dim">${r.min}-${r.max}</span> +${r.dmg}`).join('| ')
    r.push({ id: 'weapon_' + w.id, name: w.name, desc: rangeStr, isWeapon: true, weaponId: w.id, weaponDmg: wd })
  }
  const avail = combatStrategies.filter(s => !s.sanityReq || state.sanity >= s.sanityReq)
  for (const s of randomSample(avail, Math.min(2, avail.length))) {
    r.push({ id: s.id, name: s.name, desc: s.desc, isWeapon: false, defMod: s.defMod, sanityCost: s.sanityCost, counterBonus: s.counterBonus, highRisk: s.highRisk })
  }
  return r
}

// ==================== 战斗生成 ====================

export function generateCombat(state) {
  const enemies = [
    { name: '普通丧尸', hp: 20, damage: 5, noise: 1, lootChance: 0.3, desc: '步履蹒跚', traits: ['缓慢'] },
    { name: '尖叫者', hp: 10, damage: 3, noise: 6, lootChance: 0.2, desc: '刺耳尖叫', traits: ['脆弱', '噪音'] },
    { name: '丧尸犬', hp: 12, damage: 6, noise: 1, lootChance: 0.1, desc: '快速凶猛', traits: ['快速', '灵敏'] },
    { name: '爬行者', hp: 12, damage: 5, noise: 0, lootChance: 0.2, desc: '下半身已断，在地上无声爬行', traits: ['快速', '灵敏', '隐蔽'] },
    { name: '自爆者', hp: 8, damage: 20, noise: 9, lootChance: 0.1, desc: '腹部肿胀发光，靠近即爆', traits: ['脆弱', '自爆'] },
    { name: '跑尸', hp: 15, damage: 8, noise: 0, lootChance: 0.3, desc: '速度极快', traits: ['快速'] },
    { name: '臃肿丧尸', hp: 35, damage: 10, noise: 2, lootChance: 0.6, desc: '皮糙肉厚', traits: ['庞大', '缓慢'] },
    { name: '变异丧尸', hp: 50, damage: 15, noise: 3, lootChance: 0.8, desc: '扭曲肢体', traits: ['庞大', '变异'] },
    { name: '邪教徒', hp: 25, damage: 7, noise: 2, lootChance: 0.5, desc: '疯狂活人', traits: ['人型', '狡猾'] },
    { name: '孢子丧尸', hp: 18, damage: 4, noise: 1, lootChance: 0.4, desc: '身体布满真菌，死后释放毒气', traits: ['集群', '毒气'] },
    { name: '潜行者', hp: 14, damage: 7, noise: 0, lootChance: 0.3, desc: '擅长从阴影中突袭', traits: ['隐蔽', '狡猾', '快速'] },
    { name: '巨臂丧尸', hp: 45, damage: 14, noise: 4, lootChance: 0.5, desc: '右臂肿胀成巨大棍棒', traits: ['庞大', '缓慢', '重击'] },
    { name: '丧尸乌鸦', hp: 5, damage: 3, noise: 3, lootChance: 0.1, desc: '成群的感染乌鸦，从空中俯冲', traits: ['快速', '飞行', '集群'] },
    { name: '融合体', hp: 60, damage: 12, noise: 5, lootChance: 0.7, desc: '多具丧尸融为一体的恐怖肉团', traits: ['庞大', '变异', '再生'] },
  ]
  const enemy = randomPick(enemies)
  const count = randInt(1, 3)
  state.inCombat = true
  state.combatState = {
    enemy: { ...enemy, actualHp: enemy.hp * count, maxHp: enemy.hp * count, count },
    playerHp: state.hp, rounds: [], result: null,
    _defending: false, enemyDesc: getEnemyDescription(enemy),
  }
  return state.combatState
}

// ==================== 战斗回合 ====================

export function resolveCombatRound(state, actionId) {
  const combat = state.combatState
  if (!combat) return null
  if (actionId === 'flee') {
    const fleeCount = combat._fleeAttempts || 0
    combat._fleeAttempts = fleeCount + 1
    const fleeChance = Math.min(0.55 + fleeCount * 0.15, 0.9)
    if (chance(fleeChance)) {
      combat.result = 'fled'
      state.inCombat = false
      const fleeTexts = ['你抓住机会转身就跑，头也不回地冲进最近的掩体。', '你全力冲刺，身后传来愤怒的嘶吼——你成功甩掉了它们。', '你且战且退，利用地形甩开了追击。', '你趁对方一个破绽，闪身消失在废墟之间。']
      addJournalEntry(state, '✽ ' + randomPick(fleeTexts), 'action')
      return combat
    }
    const dmg = randInt(5, 12)
    state.hp = clamp(state.hp - dmg, 0, state.maxHp)
    combat.playerHp = state.hp
    combat.rounds.push({ action: 'flee', playerDmg: 0, enemyDmg: dmg, playerText: '你试图逃跑……', enemyText: `逃跑失败！被追击受到 ${dmg} 点伤害。` })
    if (state.hp <= 0) { combat.result = 'death'; state.inCombat = false }
    return combat
  }
  let round
  let isCritRound = false
  const isWeapon = actionId.startsWith('weapon_')
  let playerText = '', enemyText = '', playerDmg = 0, enemyDmg = 0
  if (isWeapon) {
    const wid = actionId.replace('weapon_', '')
    let wd = 0, wn = '拳头'
    if (wid !== 'fists') {
      const w = state.inventory.find(i => i.id === wid && i.type === 'weapon')
      if (w) { wd = w.effects.damage||0; wn = w.name }
      else {
        combat.rounds.push({ action: actionId, playerDmg: 0, enemyDmg: 0,
          playerText: '你伸手去拿武器，却发现它已不在背包中……',
          enemyText: '', isCrit: false })
        return combat
      }
      if (w && w.effects.ammo) {
        const ammoTag = '弹药:' + w.effects.ammo
        const ammoItem = state.inventory.find(i => i.tags && i.tags.includes(ammoTag))
        if (ammoItem) removeFromInventory(state, ammoItem.id, 1)
      }
    }
    const roll = d20()
    if (roll === 1) { playerDmg = 0; playerText = `🎲[${roll}] 你使用${wn}，但攻击落空了！` }
    else if (roll === 20) { playerDmg = 9999; playerText = `🎲[${roll}] 你使用${wn}打出必杀一击！💥`; isCritRound = true }
    else {
      const ranges = getHitRanges(wd)
      const hit = ranges.find(r => roll >= r.min && roll <= r.max)
      const bonusDmg = hit ? hit.dmg : 5
      playerDmg = 4 + bonusDmg
      playerText = `🎲[${roll}] 你使用${wn}造成了 ${playerDmg} 点伤害`
    }
  } else {
    const s = combatStrategies.find(x => x.id === actionId)
    let roll = d6(), bonus = 0
    if (s && s.counterBonus) {
      for (const [t, v] of Object.entries(s.counterBonus)) {
        if ((combat.enemy.traits||[]).includes(t)) { bonus += v; break }
      }
    }
    let mult = 1
    if (s && s.highRisk && roll >= 4) mult = 2
    if (s && s.sanityCost) modifyStat(state, 'sanity', -s.sanityCost)
    playerDmg = Math.max(1, (roll + bonus) * mult)
    playerText = bonus > 0
      ? `你使出${(s as any).name}，骰出了 ${roll} 点！特征克制 +${bonus}，共 ${playerDmg} 点伤害！`
      : `你使出${(s as any).name}，骰出了 ${roll} 点，造成 ${playerDmg} 点伤害。`
    if (mult > 1) playerText += ' 弱点暴露！伤害翻倍！'
    if (s && s.defMod < 1) combat._defending = true
  }
  combat.enemy.actualHp -= playerDmg
  if (combat.enemy.actualHp <= 0) {
    combat.result = 'victory'; state.inCombat = false
    state.kills += combat.enemy.count
    const deathTexts: Record<string, string[]> = {
      '普通丧尸': ['丧尸摇晃了几下，最终倒地不再动弹。', '你的一击命中了要害，丧尸像断了线一样瘫软下去。'],
      '跑尸': ['跑尸的冲刺戛然而止，在地上翻滚了几圈后静止了。', '它的速度救不了它——你精准地击中了它的头部。'],
      '臃肿丧尸': ['这庞大的躯体轰然倒塌，扬起一片尘土。', '臃肿的身躯终于支撑不住，沉重地砸在地上。'],
      '尖啸者': ['尖啸者的声音戛然而止，只留下回荡的余音。', '它张开嘴还没来得及发出声音，就被你终结了。'],
      '潜行者': ['潜行者的身影从阴影中显现，然后永远倒下了。', '它擅长隐蔽，但没能躲过你的最后一击。'],
      '自爆者': ['自爆者肿胀的身体泄了气，缓缓瘫倒——没有爆炸。', '你在它引爆之前结束了它的挣扎。'],
      '巨臂丧尸': ['巨臂丧尸那粗壮的手臂垂落下来，整个身躯轰然倒下。', '它巨大的手臂在地上砸出一个凹坑，然后彻底静止了。'],
      '爬行者': ['爬行者抽搐了几下，终于不再动了。', '它贴在地面上，像一只被踩碎的虫子一样不再动弹。'],
    }
    const defaults = ['它倒下了，再也没有站起来。', '丧尸终于停止了行动。']
    const name = combat.enemy.name
    const pool = deathTexts[name] || defaults
    const deathDesc = pool[Math.floor(Math.random() * pool.length)]
    enemyText = `${deathDesc}`
    round = { action: actionId, playerDmg, enemyDmg: 0, playerText, enemyText, isCrit: isCritRound }
    combat.rounds.push(round)
    addJournalEntry(state, `✽ 战斗胜利！击败了 ${combat.enemy.count} 只${combat.enemy.name}。`, 'combat')
    return combat
  }
  const wn = isWeapon ? (state.inventory.find(i => i.id === actionId.replace('weapon_','') && i.type === 'weapon')?.effects.noise||0) : 0
  if (wn >= 3 && chance(0.3)) { combat.enemy.actualHp += randInt(5, 15); combat.enemy.count += randInt(1, 2); playerText += ' ⚠️ 噪音引来了更多丧尸！' }
  let defMod = combat._defending ? 0.5 : 1.0
  combat._defending = false
  enemyDmg = Math.round(calcDamage(combat.enemy.damage, 0.2) * defMod)
  const armor = state.inventory.find(i => i.type === 'armor' && i.effects?.damageReduction)
  if (armor && armor.effects.damageReduction) {
    enemyDmg = Math.floor(enemyDmg * (1 - armor.effects.damageReduction))
    if (armor.effects.durability && --armor.effects.durability <= 0) { removeFromInventory(state, armor.id); enemyText += ` ⚠️${armor.name}损坏！` }
  }
  round = { action: actionId, playerDmg, enemyDmg, playerText, enemyText: enemyText + ` ${combat.enemy.name}反击，${enemyDmg} 点伤害。` + (enemyDmg <= 0 ? '（被格挡）' : ''), isCrit: false }
  state.hp = clamp(state.hp - enemyDmg, 0, state.maxHp)
  combat.playerHp = state.hp
  if (chance(0.2)) { const ia = randInt(5,10); state.infection = clamp(state.infection+ia,0,state.maxInfection); round.enemyText += ` ⚠️咬伤感染 +${ia}` }
  if (state.hp <= 0) { combat.result = 'death'; state.inCombat = false; round.enemyText += ' 💀 你倒下了……' }
  combat.rounds.push(round)
  return combat
}

export function fleeCombat(state) { return resolveCombatRound(state, 'flee') }

export function autoResolveCombat(state) {
  const combat = state.combatState
  if (!combat) return null
  const weapon = getBestWeapon(state) || { effects: { damage: 1 } }
  const bd = weapon.effects.damage||1, hp = combat.enemy.actualHp
  const avgDmg = 4 + bd * 2
  const rounds = Math.ceil(hp / avgDmg), ok = chance(0.5+bd*0.05-combat.enemy.damage*0.02)
  if (ok) {
    combat.result = 'victory'; state.inCombat = false; state.kills += combat.enemy.count
    const d = randInt(3,8)*rounds; state.hp = clamp(state.hp-d,0,state.maxHp)
    addJournalEntry(state, `✽ 自动战斗！使用${weapon.name} ${rounds}回合击败${combat.enemy.count}只${combat.enemy.name}，损失${d}HP。`, 'combat')
  } else {
    const d = randInt(8,15)*rounds; state.hp = clamp(state.hp-d,0,state.maxHp)
    if (state.hp <= 0) { combat.result='death';state.inCombat=false;addJournalEntry(state,`💀 自动战斗失败！倒下了。`,'danger') }
    else { combat.result='fled';state.inCombat=false;addJournalEntry(state,`✽ 自动战斗失利，损失${d}HP。`,'combat') }
  }
  return combat
}
