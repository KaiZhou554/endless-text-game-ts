/**
 * NPC 工具函数 — 对话节点查询
 * 引擎层：引用 data/npcs/ 的纯数据，不持有逻辑数据
 */

import { npcDB } from '../data/npcs/index.js'

/**
 * 从NPC数据中获取初始对话节点
 */
export function getNPCDialogue(npcId) {
  const npc = npcDB[npcId]
  if (!npc) return null
  return npc.dialogueTree.start
}

/**
 * 获取对话节点的下一个节点
 */
export function getDialogueNode(npcId, nodeId) {
  const npc = npcDB[npcId]
  if (!npc) return null
  return npc.dialogueTree[nodeId] || null
}
