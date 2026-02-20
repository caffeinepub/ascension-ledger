import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // --- Types ---

  public type StatArray = [Int];
  public type StatNameArray = [Text];

  type Mob = {
    name : Text;
    level : Nat;
    typeIndex : Nat;
    stats : StatArray;
  };

  type ExpDrop = {
    dropType : Text;
    value : Nat;
  };

  type Loot = {
    coins : Nat;
    exp : [ExpDrop];
    inventory : [Text];
  };

  type CombatResult = {
    playerVictory : Bool;
    playerStats : StatArray;
    mobStats : StatArray;
    loot : ?Loot;
  };

  type Player = {
    principal : Principal;
    nickname : Text;
    stats : StatArray;
    inventory : [Text];
    lastCombat : Time.Time;
    level : Nat;
  };

  type MissionRequirements = {
    minLevel : Nat;
  };

  public type Mission = {
    id : Text;
    name : Text;
    description : Text;
    xpReward : Nat;
    coinReward : Nat;
    missionType : { #daily; #repeatable };
    requirements : MissionRequirements;
  };

  public type SkillRequirements = {
    minLevel : Nat;
    minStats : [(Nat, Int)];
  };

  public type Skill = {
    id : Text;
    name : Text;
    description : Text;
    requirements : SkillRequirements;
  };

  public type CooldownArray = [(Text, Time.Time)];
  public type UserProfile = {
    nickname : Text;
    level : Nat;
    xp : Nat;
    xpToNextLevel : Nat;
    stats : StatArray;
    unspentStatPoints : Nat;
    inventory : [Text];
    coins : Nat;
    completedMissions : [Text];
    lastMissionCompletionTime : CooldownArray;
    unlockedSkills : [Text];
  };

  public type UserProfileInternal = {
    nickname : Text;
    level : Nat;
    xp : Nat;
    xpToNextLevel : Nat;
    stats : StatArray;
    unspentStatPoints : Nat;
    inventory : [Text];
    coins : Nat;
    completedMissions : [Text];
    lastMissionCompletionTime : Map.Map<Text, Time.Time>;
    unlockedSkills : [Text];
  };

  // --- Globals ---

  let mobTypes = [
    ["Aquarius", "Capricornius", "Cancerus", "Sagittarius", "Leo"],
    ["Human Warrior", "Human Mage", "Human Rogue", "Human Archer", "Human Scholar"],
    ["Goblin", "Troll", "Orc", "Minotaur", "Naga"],
  ];

  func buildMobTypeIndexMap() : Map.Map<Nat, Text> {
    let map = Map.empty<Nat, Text>();
    map.add(0, "Mythical Creature");
    map.add(1, "Human");
    map.add(2, "Monster");
    map;
  };

  let mobTypeIndexMap = buildMobTypeIndexMap();

  let statNamesArray : [Text] = [
    "Strength",
    "Agility",
    "Vitality",
    "Focus",
    "Spirit",
    "Charisma",
    "Intuition",
    "Intelligence",
    "Perception",
    "Speed",
  ];

  let _statShortNamesArray : [Text] = [
    "STR",
    "AGI",
    "VIT",
    "FOC",
    "SPI",
    "CHA",
    "INTU",
    "INTEL",
    "PER",
    "SPD",
  ];

  let directionCoordinatesArray = [(-1, 0), (1, 0), (0, -1), (0, 1)];

  let players = Map.empty<Principal, Player>();
  let mobs = Map.empty<Nat, Mob>();
  let profiles = Map.empty<Principal, UserProfileInternal>();

  let missions = Map.empty<Text, Mission>();
  let skills = Map.empty<Text, Skill>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- Initialization ---

  func initializeMissionsAndSkills() {
    missions.add("daily_training", {
      id = "daily_training";
      name = "Daily Training";
      description = "Complete your daily training routine";
      xpReward = 100;
      coinReward = 50;
      missionType = #daily;
      requirements = { minLevel = 1 };
    });

    missions.add("hunt_goblins", {
      id = "hunt_goblins";
      name = "Hunt Goblins";
      description = "Defeat goblins in the forest";
      xpReward = 50;
      coinReward = 25;
      missionType = #repeatable;
      requirements = { minLevel = 1 };
    });

    skills.add("power_strike", {
      id = "power_strike";
      name = "Power Strike";
      description = "A powerful melee attack";
      requirements = {
        minLevel = 5;
        minStats = [(0, 20)];
      };
    });

    skills.add("quick_reflexes", {
      id = "quick_reflexes";
      name = "Quick Reflexes";
      description = "Improved dodge chance";
      requirements = {
        minLevel = 3;
        minStats = [(1, 15)];
      };
    });
  };
  initializeMissionsAndSkills();

  func calculateXpToNextLevel(level : Nat) : Nat {
    let baseXp = 100;
    var xpNeeded = baseXp * level;
    if (level > 10) {
      xpNeeded *= level;
    };
    xpNeeded;
  };

  func createDefaultProfile(_caller : Principal, nickname : Text) : UserProfileInternal {
    let startingStats = Array.tabulate<Int>(10, func(_) { 10 });
    {
      nickname;
      level = 1;
      xp = 0;
      xpToNextLevel = calculateXpToNextLevel(1);
      stats = startingStats;
      unspentStatPoints = 0;
      inventory = [];
      coins = 0;
      completedMissions = [];
      lastMissionCompletionTime = Map.empty<Text, Time.Time>();
      unlockedSkills = [];
    };
  };

  func toUserProfile(internal : UserProfileInternal) : UserProfile {
    let cooldownArray = internal.lastMissionCompletionTime.toArray();
    {
      nickname = internal.nickname;
      level = internal.level;
      xp = internal.xp;
      xpToNextLevel = internal.xpToNextLevel;
      stats = internal.stats;
      unspentStatPoints = internal.unspentStatPoints;
      inventory = internal.inventory;
      coins = internal.coins;
      completedMissions = internal.completedMissions;
      lastMissionCompletionTime = cooldownArray;
      unlockedSkills = internal.unlockedSkills;
    };
  };

  // --- Profile Management ---

  func getCallerUserProfileInternal(caller : Principal) : ?UserProfileInternal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  func getUserProfileInternal(caller : Principal, user : Principal) : ?UserProfileInternal {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  func saveCallerUserProfileInternal(profile : UserProfileInternal, caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  func initializeProfileInternal(nickname : Text, caller : Principal) : UserProfileInternal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can initialize profiles");
    };

    switch (profiles.get(caller)) {
      case (?existing) { existing };
      case (null) {
        let newProfile = createDefaultProfile(caller, nickname);
        profiles.add(caller, newProfile);
        newProfile;
      };
    };
  };

  // --- XP & Level-Up ---

  func addXpInternal(amount : Nat, caller : Principal) : UserProfileInternal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add XP");
    };

    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found. Please initialize your profile first.") };
      case (?profile) {
        var newXp = profile.xp + amount;
        var newLevel = profile.level;
        var newUnspentPoints = profile.unspentStatPoints;
        var xpToNext = profile.xpToNextLevel;

        while (newXp >= xpToNext) {
          newXp -= xpToNext;
          newLevel += 1;
          newUnspentPoints += 5;
          xpToNext := calculateXpToNextLevel(newLevel);
        };

        let updatedProfile : UserProfileInternal = {
          nickname = profile.nickname;
          level = newLevel;
          xp = newXp;
          xpToNextLevel = xpToNext;
          stats = profile.stats;
          unspentStatPoints = newUnspentPoints;
          inventory = profile.inventory;
          coins = profile.coins;
          completedMissions = profile.completedMissions;
          lastMissionCompletionTime = profile.lastMissionCompletionTime;
          unlockedSkills = profile.unlockedSkills;
        };

        profiles.add(caller, updatedProfile);
        updatedProfile;
      };
    };
  };

  // --- Stat Allocation ---

  func allocateStatsInternal(statAllocations : [(Nat, Int)], caller : Principal) : UserProfileInternal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can allocate stats");
    };

    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found. Please initialize your profile first.") };
      case (?profile) {
        var totalPointsSpent = 0;
        for ((_, points) in statAllocations.values()) {
          if (points < 0) {
            Runtime.trap("Cannot allocate negative stat points");
          };
          totalPointsSpent += Int.abs(points);
        };

        if (totalPointsSpent > profile.unspentStatPoints) {
          Runtime.trap("Insufficient unspent stat points. Available: " # profile.unspentStatPoints.toText() # ", Requested: " # totalPointsSpent.toText());
        };

        let newStats = Array.tabulate(
          profile.stats.size(),
          func(i) {
            switch (statAllocations.find(func((statIndex, _)) { statIndex == i })) {
              case (?(_, points)) { profile.stats[i] + points };
              case (null) { profile.stats[i] };
            };
          },
        );

        let updatedProfile : UserProfileInternal = {
          profile with
          unspentStatPoints = profile.unspentStatPoints - totalPointsSpent;
          stats = newStats;
        };

        profiles.add(caller, updatedProfile);
        updatedProfile;
      };
    };
  };

  // --- Missions ---

  func listMissionsInternal(caller : Principal) : [Mission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list missions");
    };
    missions.values().toArray();
  };

  func getMissionInternal(missionId : Text, caller : Principal) : ?Mission {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view missions");
    };
    missions.get(missionId);
  };

  func completeMissionInternal(missionId : Text, caller : Principal) : UserProfileInternal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete missions");
    };

    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found. Please initialize your profile first.") };
      case (?profile) {
        switch (missions.get(missionId)) {
          case (null) { Runtime.trap("Mission not found: " # missionId) };
          case (?mission) {
            if (profile.level < mission.requirements.minLevel) {
              Runtime.trap("Insufficient level. Required: " # mission.requirements.minLevel.toText());
            };

            switch (mission.missionType) {
              case (#daily) {
                switch (profile.lastMissionCompletionTime.get(missionId)) {
                  case (?lastTime) {
                    let now = Time.now();
                    let dayInNanos = 86_400_000_000_000;
                    if (now - lastTime < dayInNanos) {
                      Runtime.trap("Daily mission already completed today. Try again tomorrow.");
                    };
                  };
                  case (null) {};
                };
              };
              case (#repeatable) {};
            };

            let newCompletionTimes = profile.lastMissionCompletionTime;
            newCompletionTimes.add(missionId, Time.now());

            let alreadyCompleted = profile.completedMissions.find(func(id) { id == missionId }) != null;
            let newCompletedMissions = if (not alreadyCompleted) {
              let completedMissions = profile.completedMissions;
              let varCompletedMissions = Array.tabulate(completedMissions.size() + 1, func(i) { if (i < completedMissions.size()) { completedMissions[i] } else { missionId } });
              varCompletedMissions : [Text];
            } else {
              profile.completedMissions;
            };

            var newXp = profile.xp + mission.xpReward;
            var newLevel = profile.level;
            var newUnspentPoints = profile.unspentStatPoints;
            var xpToNext = profile.xpToNextLevel;

            while (newXp >= xpToNext) {
              newXp -= xpToNext;
              newLevel += 1;
              newUnspentPoints += 5;
              xpToNext := calculateXpToNextLevel(newLevel);
            };

            let updatedProfile : UserProfileInternal = {
              nickname = profile.nickname;
              level = newLevel;
              xp = newXp;
              xpToNextLevel = xpToNext;
              stats = profile.stats;
              unspentStatPoints = newUnspentPoints;
              inventory = profile.inventory;
              coins = profile.coins + mission.coinReward;
              completedMissions = newCompletedMissions;
              lastMissionCompletionTime = newCompletionTimes;
              unlockedSkills = profile.unlockedSkills;
            };

            profiles.add(caller, updatedProfile);
            updatedProfile;
          };
        };
      };
    };
  };

  // --- Skills ---

  func listSkillsInternal(caller : Principal) : [Skill] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list skills");
    };
    skills.values().toArray();
  };

  func getSkillInternal(skillId : Text, caller : Principal) : ?Skill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view skills");
    };
    skills.get(skillId);
  };

  func canUnlockSkill(profile : UserProfileInternal, skill : Skill) : Bool {
    if (profile.level < skill.requirements.minLevel) {
      return false;
    };

    for ((statIndex, minValue) in skill.requirements.minStats.values()) {
      if (statIndex >= profile.stats.size() or profile.stats[statIndex] < minValue) {
        return false;
      };
    };

    true;
  };

  func unlockSkillInternal(skillId : Text, caller : Principal) : UserProfileInternal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlock skills");
    };

    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found. Please initialize your profile first.") };
      case (?profile) {
        switch (skills.get(skillId)) {
          case (null) { Runtime.trap("Skill not found: " # skillId) };
          case (?skill) {
            if (profile.unlockedSkills.find(func(id) { id == skillId }) != null) {
              Runtime.trap("Skill already unlocked: " # skillId);
            };

            if (not canUnlockSkill(profile, skill)) {
              Runtime.trap("Requirements not met for skill: " # skillId);
            };

            let unlockedSkills = profile.unlockedSkills;
            let newUnlockedSkills = Array.tabulate(unlockedSkills.size() + 1, func(i) { if (i < unlockedSkills.size()) { unlockedSkills[i] } else { skillId } });

            let updatedProfile : UserProfileInternal = {
              nickname = profile.nickname;
              level = profile.level;
              xp = profile.xp;
              xpToNextLevel = profile.xpToNextLevel;
              stats = profile.stats;
              unspentStatPoints = profile.unspentStatPoints;
              inventory = profile.inventory;
              coins = profile.coins;
              completedMissions = profile.completedMissions;
              lastMissionCompletionTime = profile.lastMissionCompletionTime;
              unlockedSkills = newUnlockedSkills;
            };

            profiles.add(caller, updatedProfile);
            updatedProfile;
          };
        };
      };
    };
  };

  // --- Public Interface ---

  public shared ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    switch (getCallerUserProfileInternal(caller)) {
      case (?profile) { ?toUserProfile(profile) };
      case (null) { null };
    };
  };

  public shared ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    switch (getUserProfileInternal(caller, user)) {
      case (?profile) { ?toUserProfile(profile) };
      case (null) { null };
    };
  };

  public shared ({ caller }) func initializeProfile(nickname : Text) : async UserProfile {
    toUserProfile(initializeProfileInternal(nickname, caller));
  };

  public shared ({ caller }) func addXp(amount : Nat) : async UserProfile {
    toUserProfile(addXpInternal(amount, caller));
  };

  public shared ({ caller }) func allocateStats(statAllocations : [(Nat, Int)]) : async UserProfile {
    toUserProfile(allocateStatsInternal(statAllocations, caller));
  };

  public shared ({ caller }) func listMissions() : async [Mission] {
    listMissionsInternal(caller);
  };

  public shared ({ caller }) func getMission(missionId : Text) : async ?Mission {
    getMissionInternal(missionId, caller);
  };

  public shared ({ caller }) func completeMission(missionId : Text) : async UserProfile {
    toUserProfile(completeMissionInternal(missionId, caller));
  };

  public shared ({ caller }) func listSkills() : async [Skill] {
    listSkillsInternal(caller);
  };

  public shared ({ caller }) func getSkill(skillId : Text) : async ?Skill {
    getSkillInternal(skillId, caller);
  };

  public shared ({ caller }) func unlockSkill(skillId : Text) : async UserProfile {
    toUserProfile(unlockSkillInternal(skillId, caller));
  };

  // --- Remaining Functions ---

  public type DamageResult = {
    damage : Nat;
    stats : [Int];
  };

  func getPermissions(caller : Principal, requiredRole : AccessControl.UserRole) {
    if (not (AccessControl.hasPermission(accessControlState, caller, requiredRole))) {
      switch (requiredRole) {
        case (#user) {
          Runtime.trap("Unauthorized: Only users can perform this action");
        };
        case (#admin) {
          Runtime.trap("Unauthorized: Only admins can perform this action");
        };
        case (#guest) {
          Runtime.trap("Unauthorized: Guests cannot perform this action");
        };
      };
    };
  };

  public shared ({ caller }) func rollDie(sides : Nat) : async Nat {
    getPermissions(caller, #user);
    let randomInt = sides.toInt();
    switch (randomInt) {
      case (0) { 1 };
      case (nat) { nat.toNat() + 1 };
    };
  };

  func getDamageInternal(caller : Principal, damageStats : [Int]) : DamageResult {
    getPermissions(caller, #user);

    let size = damageStats.size();
    if (size != 10) {
      Runtime.trap("Stats must have exactly 10 elements. Received: " # damageStats.size().toText());
    };

    var damage = 0;
    for ((i, stat) in damageStats.values().enumerate()) {
      if (stat > 0) { damage += (size - i : Nat) * stat.toNat() };
    };

    let _lastStat = damageStats[damageStats.size() - 1];

    let damageResult : DamageResult = { damage; stats = damageStats };
    damageResult;
  };

  public shared ({ caller }) func getDamage(damageStats : [Int]) : async DamageResult {
    getDamageInternal(caller, damageStats);
  };

  public query ({ caller }) func getStatNames() : async StatNameArray {
    statNamesArray;
  };

  module Mob {
    public func compareByName(mob1 : Mob, mob2 : Mob) : Order.Order {
      Text.compare(mob1.name, mob2.name);
    };
  };

  public query ({ caller }) func listAllMobs() : async [Mob] {
    mobs.values().toArray().sort(Mob.compareByName);
  };

  public query ({ caller }) func listAllMobTypes() : async [(Nat, Text)] {
    mobTypeIndexMap.toArray();
  };

  func getMobStatsInternal(caller : Principal, _mobTypeIndex : Nat, _level : Nat, _rangeRadius : Int) : StatArray {
    getPermissions(caller, #user);

    let size = statNamesArray.size();

    let baseStats : StatArray = Array.tabulate<Int>(
      size,
      func(i) {
        if (i < 3) { 10 * (1 + (size - i : Nat)) } else { 6 * (1 + (size - i : Nat)) };
      },
    );

    baseStats;
  };

  func getStartingStatsInternal(caller : Principal, pointPool : Int, _rangeMin : Int, _rangeMax : Int) : StatArray {
    getPermissions(caller, #user);

    if (pointPool < 1 or pointPool > 96) {
      Runtime.trap("Point pool must be between 1 and 96. Received " # pointPool.toText());
    };

    let size = statNamesArray.size();
    let defaultStatPoints = pointPool / (size : Int);

    Array.tabulate<Int>(
      size,
      func(_) { defaultStatPoints },
    );
  };

  func getStatValueInternal(caller : Principal, _basicStats : StatArray, multipliers : StatArray, _statIndex : Nat) : ?Int {
    getPermissions(caller, #user);

    if (multipliers.size() != 10) {
      Runtime.trap("Input array must have exactly 10 elements. Received " # multipliers.size().toText());
    };
    ?multipliers[0];
  };

  func getDirectionFromCoordinatesInternal(caller : Principal, _currentPosition : (Nat, Nat), _targetPosition : (Nat, Nat)) : (Text, Text) {
    getPermissions(caller, #user);
    return ("up", "north");
  };

  func addMissionInternal(mission : Mission, caller : Principal) {
    getPermissions(caller, #admin);
    missions.add(mission.id, mission);
  };

  func addSkillInternal(skill : Skill, caller : Principal) {
    getPermissions(caller, #admin);
    skills.add(skill.id, skill);
  };

  public shared ({ caller }) func getMobStats(_mobTypeIndex : Nat, _level : Nat, _rangeRadius : Int) : async StatArray {
    getMobStatsInternal(caller, _mobTypeIndex, _level, _rangeRadius);
  };

  public shared ({ caller }) func getStartingStats(pointPool : Int, _rangeMin : Int, _rangeMax : Int) : async StatArray {
    getStartingStatsInternal(caller, pointPool, _rangeMin, _rangeMax);
  };

  public shared ({ caller }) func getStatValue(_basicStats : StatArray, multipliers : StatArray, _statIndex : Nat) : async ?Int {
    getStatValueInternal(caller, _basicStats, multipliers, _statIndex);
  };

  public shared ({ caller }) func getDirectionFromCoordinates(_currentPosition : (Nat, Nat), _targetPosition : (Nat, Nat)) : async (Text, Text) {
    getDirectionFromCoordinatesInternal(caller, _currentPosition, _targetPosition);
  };

  public shared ({ caller }) func addMission(mission : Mission) : async () {
    addMissionInternal(mission, caller);
  };

  public shared ({ caller }) func addSkill(skill : Skill) : async () {
    addSkillInternal(skill, caller);
  };
};
