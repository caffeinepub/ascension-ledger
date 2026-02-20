import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type StatArray = Array<bigint>;
export interface DailyTaskRecommendation {
    incomplete: Array<DailyTask>;
    completed: Array<DailyTask>;
}
export interface Mob {
    name: string;
    level: bigint;
    typeIndex: bigint;
    stats: StatArray;
}
export type Time = bigint;
export interface SkillRequirements {
    minLevel: bigint;
    minStats: Array<[bigint, bigint]>;
}
export type StatNameArray = Array<string>;
export interface DamageResult {
    damage: bigint;
    stats: Array<bigint>;
}
export type CooldownArray = Array<[string, Time]>;
export interface CustomTaskWithStatus {
    id: string;
    title: string;
    completed: boolean;
    attributePoints: bigint;
    points: bigint;
}
export interface MissionRequirements {
    minLevel: bigint;
}
export interface Skill {
    id: string;
    name: string;
    description: string;
    requirements: SkillRequirements;
}
export type QuestionnaireAnswers = Array<string>;
export interface DailyTask {
    id: string;
    xpReward: bigint;
    description: string;
    coinReward: bigint;
}
export interface Mission {
    id: string;
    missionType: Variant_repeatable_daily;
    xpReward: bigint;
    name: string;
    description: string;
    coinReward: bigint;
    requirements: MissionRequirements;
}
export interface UserProfile {
    xp: bigint;
    credits: bigint;
    nickname: string;
    inventory: Array<string>;
    coins: bigint;
    unspentStatPoints: bigint;
    completedMissions: Array<string>;
    completedDailyTasks: Array<string>;
    level: bigint;
    stats: StatArray;
    questionnaireAnswers: QuestionnaireAnswers;
    xpToNextLevel: bigint;
    unlockedSkills: Array<string>;
    lastMissionCompletionTime: CooldownArray;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_repeatable_daily {
    repeatable = "repeatable",
    daily = "daily"
}
export interface backendInterface {
    addDailyTask(task: DailyTask): Promise<void>;
    addMission(mission: Mission): Promise<void>;
    addSkill(skill: Skill): Promise<void>;
    addXp(amount: bigint): Promise<UserProfile>;
    allocateStats(statAllocations: Array<[bigint, bigint]>): Promise<UserProfile>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeMission(missionId: string): Promise<UserProfile>;
    createCustomTask(title: string, points: bigint, attributePoints: bigint): Promise<void>;
    deleteAccount(): Promise<void>;
    deleteCustomTask(taskId: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomTasks(): Promise<Array<CustomTaskWithStatus>>;
    getDailyTaskRecommendations(): Promise<DailyTaskRecommendation>;
    getDamage(damageStats: Array<bigint>): Promise<DamageResult>;
    getDirectionFromCoordinates(_currentPosition: [bigint, bigint], _targetPosition: [bigint, bigint]): Promise<[string, string]>;
    getMission(missionId: string): Promise<Mission | null>;
    getMobStats(_mobTypeIndex: bigint, _level: bigint, _rangeRadius: bigint): Promise<StatArray>;
    getQuestionnaireAnswers(): Promise<QuestionnaireAnswers | null>;
    getSkill(skillId: string): Promise<Skill | null>;
    getStartingStats(pointPool: bigint, _rangeMin: bigint, _rangeMax: bigint): Promise<StatArray>;
    getStatNames(): Promise<StatNameArray>;
    getStatValue(_basicStats: StatArray, multipliers: StatArray, _statIndex: bigint): Promise<bigint | null>;
    getUserCustomTasks(user: Principal): Promise<Array<CustomTaskWithStatus>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeProfile(nickname: string): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    listAllMobTypes(): Promise<Array<[bigint, string]>>;
    listAllMobs(): Promise<Array<Mob>>;
    listMissions(): Promise<Array<Mission>>;
    listSkills(): Promise<Array<Skill>>;
    markDailyTaskCompleted(taskId: string): Promise<void>;
    rollDie(sides: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitQuestionnaireAnswers(answers: QuestionnaireAnswers): Promise<void>;
    toggleCustomTaskCompletion(taskId: string, completed: boolean): Promise<void>;
    unlockSkill(skillId: string): Promise<UserProfile>;
    updateUsername(newUsername: string): Promise<void>;
}
