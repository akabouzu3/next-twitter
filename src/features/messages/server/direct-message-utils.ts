import "server-only";

/**
 * 1対1DMの重複作成を防ぐための安定キーを作る。
 *
 * ユーザーIDをソートしてから連結することで、A→B と B→A のどちらから開始しても
 * 同じ `directKey` になり、DB の unique 制約で同一会話へ集約できる。
 */
export function createDirectConversationKey(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join(":");
}
