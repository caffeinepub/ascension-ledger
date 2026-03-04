export type RankInfo = {
  rank: string;
  isShadowMonarch: boolean;
  color: string;
};

export function getRankFromLevel(level: bigint | number): RankInfo {
  const lvl = typeof level === "bigint" ? Number(level) : level;

  if (lvl >= 60) {
    return {
      rank: "Shadow Monarch",
      isShadowMonarch: true,
      color: "shadow-monarch",
    };
  }
  if (lvl >= 50) {
    return {
      rank: "SSS Rank Hunter",
      isShadowMonarch: false,
      color: "sss-rank",
    };
  }
  if (lvl >= 40) {
    return { rank: "SS Rank Hunter", isShadowMonarch: false, color: "ss-rank" };
  }
  if (lvl >= 30) {
    return { rank: "S Rank Hunter", isShadowMonarch: false, color: "s-rank" };
  }
  if (lvl >= 20) {
    return { rank: "A Rank Hunter", isShadowMonarch: false, color: "a-rank" };
  }
  if (lvl >= 15) {
    return { rank: "B Rank Hunter", isShadowMonarch: false, color: "b-rank" };
  }
  if (lvl >= 10) {
    return { rank: "C Rank Hunter", isShadowMonarch: false, color: "c-rank" };
  }
  if (lvl >= 5) {
    return { rank: "D Rank Hunter", isShadowMonarch: false, color: "d-rank" };
  }
  return { rank: "E Rank Hunter", isShadowMonarch: false, color: "e-rank" };
}
