import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

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

  public type DailyTask = {
    id : Text;
    description : Text;
    xpReward : Nat;
    coinReward : Nat;
  };

  public type CustomTask = {
    id : Text;
    title : Text;
    points : Nat;
    attributePoints : Nat;
  };

  public type CustomTaskWithStatus = {
    id : Text;
    title : Text;
    points : Nat;
    attributePoints : Nat;
    completed : Bool;
  };

  public type DailyTaskRecommendation = {
    completed : [DailyTask];
    incomplete : [DailyTask];
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

  public type QuestionnaireAnswers = [Text];

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
    questionnaireAnswers : QuestionnaireAnswers;
    completedDailyTasks : [Text];
    credits : Nat;
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
    questionnaireAnswers : QuestionnaireAnswers;
    completedDailyTasks : [Text];
    customTaskStatus : Map.Map<Text, Bool>;
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
    "Academics",
    "Creativity",
    "Fitness",
    "Health",
    "Life Skills",
    "Mental Health",
    "Productivity",
    "Relationship Building",
    "Self Awareness",
    "Self Care",
    "Social Awareness",
    "Wealth",
    "Work",
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
  let skills : Map.Map<Text, Skill> = Map.empty();

  let dailyTasks = Map.empty<Text, DailyTask>();
  var customTasks = Map.empty<Principal, Map.Map<Text, CustomTask>>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- Constants ---
  let MAX_ATTRIBUTE_POINTS_PER_TASK : Nat = 10;

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

    // Physical Skills
    skills.add("strength_training", {
      id = "strength_training";
      name = "Strength Training";
      description = "Increases your physical strength and endurance";
      requirements = {
        minLevel = 2;
        minStats = [(2, 15)];
      };
    });

    // Mental Skills
    skills.add("improved_focus", {
      id = "improved_focus";
      name = "Improved Focus";
      description = "Enhances your ability to concentrate and stay on task";
      requirements = {
        minLevel = 2;
        minStats = [(3, 15)];
      };
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

    // Social Skills
    skills.add("active_listening", {
      id = "active_listening";
      name = "Active Listening";
      description = "Enhances communication and understanding in conversations";
      requirements = {
        minLevel = 2;
        minStats = [(7, 10)];
      };
    });

    // Creative Skills
    skills.add("creative_writing", {
      id = "creative_writing";
      name = "Creative Writing";
      description = "Improves your ability to express ideas creatively";
      requirements = {
        minLevel = 2;
        minStats = [(1, 12)];
      };
    });

    // Financial Skills
    skills.add("budgeting", {
      id = "budgeting";
      name = "Budgeting";
      description = "Teaches financial planning and money management";
      requirements = {
        minLevel = 2;
        minStats = [(11, 10)];
      };
    });

    // Health Skills
    skills.add("nutrition_knowledge", {
      id = "nutrition_knowledge";
      name = "Nutrition Knowledge";
      description = "Enhances understanding of healthy eating habits";
      requirements = {
        minLevel = 2;
        minStats = [(3, 10)];
      };
    });

    // Learning Skills
    skills.add("speed_reading", {
      id = "speed_reading";
      name = "Speed Reading";
      description = "Improves reading comprehension and speed";
      requirements = {
        minLevel = 2;
        minStats = [(0, 12)];
      };
    });

    // Personal Care Skills
    skills.add("time_management", {
      id = "time_management";
      name = "Time Management";
      description = "Enhances productivity and efficiency";
      requirements = {
        minLevel = 2;
        minStats = [(6, 12)];
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
    let startingStats = Array.tabulate<Int>(13, func(_) { 10 });
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
      questionnaireAnswers = [];
      completedDailyTasks = [];
      customTaskStatus = Map.empty<Text, Bool>();
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
      questionnaireAnswers = internal.questionnaireAnswers;
      completedDailyTasks = internal.completedDailyTasks;
      credits = internal.coins;
    };
  };

  // --- Custom Tasks Methods ---

  public shared ({ caller }) func createCustomTask(title : Text, points : Nat, attributePoints : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create custom tasks");
    };

    // Validate attributePoints to prevent abuse
    if (attributePoints > MAX_ATTRIBUTE_POINTS_PER_TASK) {
      Runtime.trap("Attribute points cannot exceed " # MAX_ATTRIBUTE_POINTS_PER_TASK.toText() # " per task");
    };

    let newTask = {
      id = Time.now().toText();
      title;
      points;
      attributePoints;
    };

    let existingUserTasks = switch (customTasks.get(caller)) {
      case (null) {
        let newMap = Map.empty<Text, CustomTask>();
        customTasks.add(caller, newMap);
        newMap;
      };
      case (?tasks) { tasks };
    };

    existingUserTasks.add(newTask.id, newTask);
  };

  public query ({ caller }) func getCustomTasks() : async [CustomTaskWithStatus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view custom tasks");
    };

    let tasks = switch (customTasks.get(caller)) {
      case (null) { Map.empty<Text, CustomTask>() };
      case (?tasks) { tasks };
    };

    let profile = switch (profiles.get(caller)) {
      case (null) { Map.empty<Text, Bool>() };
      case (?profile) { profile.customTaskStatus };
    };

    let tasksWithStatus = tasks.toArray().map(
      func((_, task)) {
        {
          id = task.id;
          title = task.title;
          points = task.points;
          attributePoints = task.attributePoints;
          completed = switch (profile.get(task.id)) {
            case (null) { false };
            case (?status) { status };
          };
        };
      }
    );
    tasksWithStatus;
  };

  public query ({ caller }) func getUserCustomTasks(user : Principal) : async [CustomTaskWithStatus] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own custom tasks");
    };

    let tasks = switch (customTasks.get(user)) {
      case (null) { Map.empty<Text, CustomTask>() };
      case (?tasks) { tasks };
    };

    let profile = switch (profiles.get(user)) {
      case (null) { Map.empty<Text, Bool>() };
      case (?profile) { profile.customTaskStatus };
    };

    let tasksWithStatus = tasks.toArray().map(
      func((_, task)) {
        {
          id = task.id;
          title = task.title;
          points = task.points;
          attributePoints = task.attributePoints;
          completed = switch (profile.get(task.id)) {
            case (null) { false };
            case (?status) { status };
          };
        };
      }
    );
    tasksWithStatus;
  };

  public shared ({ caller }) func deleteCustomTask(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete custom tasks");
    };

    // Get the user's tasks
    let userTasks = switch (customTasks.get(caller)) {
      case (null) { Runtime.trap("No custom tasks found for user") };
      case (?tasks) { tasks };
    };

    // Verify the task exists and belongs to the caller
    switch (userTasks.get(taskId)) {
      case (null) { Runtime.trap("Custom task not found: " # taskId) };
      case (?_task) {
        // Task exists and belongs to caller, proceed with deletion
        userTasks.remove(taskId);
      };
    };
  };

  public shared ({ caller }) func toggleCustomTaskCompletion(taskId : Text, completed : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can toggle custom task completion");
    };

    // Verify the task belongs to the caller
    let userTasks = switch (customTasks.get(caller)) {
      case (null) { Runtime.trap("No custom tasks found for user") };
      case (?tasks) { tasks };
    };

    let task = switch (userTasks.get(taskId)) {
      case (null) { Runtime.trap("Custom task not found: " # taskId) };
      case (?t) { t };
    };

    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found. Please initialize your profile first.") };
      case (?profile) {
        let previousStatus = switch (profile.customTaskStatus.get(taskId)) {
          case (null) { false };
          case (?status) { status };
        };

        let updatedStatus = profile.customTaskStatus;
        updatedStatus.add(taskId, completed);

        var updatedXp = profile.xp;
        var updatedCoins = profile.coins;
        var updatedLevel = profile.level;
        var updatedUnspentPoints = profile.unspentStatPoints;
        var xpToNext = profile.xpToNextLevel;

        // Award points only when marking as completed (and wasn't completed before)
        if (completed and not previousStatus) {
          updatedXp += task.points;
          updatedCoins += task.points;
          updatedUnspentPoints += task.attributePoints;

          // Handle level up
          while (updatedXp >= xpToNext) {
            updatedXp -= xpToNext;
            updatedLevel += 1;
            updatedUnspentPoints += 5;
            xpToNext := calculateXpToNextLevel(updatedLevel);
          };
        };

        let updatedProfile : UserProfileInternal = {
          nickname = profile.nickname;
          level = updatedLevel;
          xp = updatedXp;
          xpToNextLevel = xpToNext;
          stats = profile.stats;
          unspentStatPoints = updatedUnspentPoints;
          inventory = profile.inventory;
          coins = updatedCoins;
          completedMissions = profile.completedMissions;
          lastMissionCompletionTime = profile.lastMissionCompletionTime;
          unlockedSkills = profile.unlockedSkills;
          questionnaireAnswers = profile.questionnaireAnswers;
          completedDailyTasks = profile.completedDailyTasks;
          customTaskStatus = updatedStatus;
        };
        profiles.add(caller, updatedProfile);
      };
    };
  };

  // --- Profile Modification ---

  public shared ({ caller }) func updateUsername(newUsername : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update username");
    };

    if (newUsername.size() == 0) {
      Runtime.trap("Username cannot be empty");
    };

    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found. Cannot update username.") };
      case (?profile) {
        let updatedProfile : UserProfileInternal = {
          profile with
          nickname = newUsername;
        };
        profiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func deleteAccount() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete accounts");
    };

    switch (profiles.get(caller)) {
      case (null) {
        Runtime.trap("Profile not found. Cannot delete account.");
      };
      case (?_) {
        // Remove player profile and associated data
        profiles.remove(caller);
        // Remove custom tasks if any
        customTasks.remove(caller);
      };
    };
  };

  // --- Daily Tasks Methods ---

  public shared ({ caller }) func getDailyTaskRecommendations() : async DailyTaskRecommendation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get daily task recommendations");
    };

    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case (null) { Runtime.trap("Profile not found. Please initialize your profile first.") };
    };

    let today = Time.now();
    let dayInNanos = 86_400_000_000_000;
    let allTasks = dailyTasks.toArray().map(func((_, task)) { task });
    let completedToday = profile.completedDailyTasks.filter(func(taskId) {
      switch (profile.lastMissionCompletionTime.get(taskId)) {
        case (?lastTime) { today - lastTime < dayInNanos };
        case (null) { false };
      };
    });
    let incomplete = allTasks.filter(
      func(task) {
        if (completedToday.find(func(id) { id == task.id }) != null) { false } else { true };
      }
    );
    {
      completed = allTasks.filter(func(task) { completedToday.find(func(id) { id == task.id }) != null });
      incomplete;
    };
  };

  public shared ({ caller }) func markDailyTaskCompleted(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete daily tasks");
    };

    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case (null) { Runtime.trap("Profile not found. Please initialize your profile first.") };
    };

    let task = switch (dailyTasks.get(taskId)) {
      case (?t) { t };
      case (null) { Runtime.trap("Daily task not found: " # taskId) };
    };

    // Check if already completed today
    let today = Time.now();
    let dayInNanos = 86_400_000_000_000;
    switch (profile.lastMissionCompletionTime.get(taskId)) {
      case (?lastTime) {
        if (today - lastTime < dayInNanos) {
          Runtime.trap("Daily task already completed today");
        };
      };
      case (null) {};
    };

    // Award XP and coins
    var updatedXp = profile.xp + task.xpReward;
    var updatedCoins = profile.coins + task.coinReward;
    var updatedLevel = profile.level;
    var updatedUnspentPoints = profile.unspentStatPoints;
    var xpToNext = profile.xpToNextLevel;

    // Handle level up
    while (updatedXp >= xpToNext) {
      updatedXp -= xpToNext;
      updatedLevel += 1;
      updatedUnspentPoints += 5;
      xpToNext := calculateXpToNextLevel(updatedLevel);
    };

    // Update completion tracking
    let updatedCompletionTimes = profile.lastMissionCompletionTime;
    updatedCompletionTimes.add(taskId, today);

    let alreadyInList = profile.completedDailyTasks.find(func(id) { id == taskId }) != null;
    let updatedCompletedTasks = if (not alreadyInList) {
      let completedTasks = profile.completedDailyTasks;
      Array.tabulate(completedTasks.size() + 1, func(i) { 
        if (i < completedTasks.size()) { completedTasks[i] } else { taskId } 
      });
    } else {
      profile.completedDailyTasks;
    };

    let updatedProfile : UserProfileInternal = {
      nickname = profile.nickname;
      level = updatedLevel;
      xp = updatedXp;
      xpToNextLevel = xpToNext;
      stats = profile.stats;
      unspentStatPoints = updatedUnspentPoints;
      inventory = profile.inventory;
      coins = updatedCoins;
      completedMissions = profile.completedMissions;
      lastMissionCompletionTime = updatedCompletionTimes;
      unlockedSkills = profile.unlockedSkills;
      questionnaireAnswers = profile.questionnaireAnswers;
      completedDailyTasks = updatedCompletedTasks;
      customTaskStatus = profile.customTaskStatus;
    };

    profiles.add(caller, updatedProfile);
  };

  // --- Questionnaire Methods ---

  public shared ({ caller }) func submitQuestionnaireAnswers(answers : QuestionnaireAnswers) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit questionnaire answers");
    };

    switch (profiles.get(caller)) {
      case (null) {
        Runtime.trap("Profile not found. Please initialize your profile first.");
      };
      case (?profile) {
        let updatedProfile : UserProfileInternal = {
          profile with
          questionnaireAnswers = answers;
        };
        profiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getQuestionnaireAnswers() : async ?QuestionnaireAnswers {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questionnaire answers");
    };

    switch (profiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?profile.questionnaireAnswers };
    };
  };

  // --- Profile Management ---

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (profiles.get(caller)) {
      case (?profile) { ?toUserProfile(profile) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (profiles.get(user)) {
      case (?profile) { ?toUserProfile(profile) };
      case (null) { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let existingProfile = switch (profiles.get(caller)) {
      case (?p) { p };
      case (null) { Runtime.trap("Profile not found. Please initialize your profile first.") };
    };
    let internalProfile : UserProfileInternal = {
      nickname = profile.nickname;
      level = profile.level;
      xp = profile.xp;
      xpToNextLevel = profile.xpToNextLevel;
      stats = profile.stats;
      unspentStatPoints = profile.unspentStatPoints;
      inventory = profile.inventory;
      coins = profile.coins;
      completedMissions = profile.completedMissions;
      lastMissionCompletionTime = existingProfile.lastMissionCompletionTime;
      unlockedSkills = profile.unlockedSkills;
      questionnaireAnswers = profile.questionnaireAnswers;
      completedDailyTasks = profile.completedDailyTasks;
      customTaskStatus = existingProfile.customTaskStatus;
    };
    profiles.add(caller, internalProfile);
  };

  public shared ({ caller }) func initializeProfile(nickname : Text) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can initialize profiles");
    };

    let profile = switch (profiles.get(caller)) {
      case (?existing) { existing };
      case (null) {
        let newProfile = createDefaultProfile(caller, nickname);
        profiles.add(caller, newProfile);
        newProfile;
      };
    };
    toUserProfile(profile);
  };

  // --- XP & Level-Up ---

  public shared ({ caller }) func addXp(amount : Nat) : async UserProfile {
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
          questionnaireAnswers = profile.questionnaireAnswers;
          completedDailyTasks = profile.completedDailyTasks;
          customTaskStatus = profile.customTaskStatus;
        };

        profiles.add(caller, updatedProfile);
        toUserProfile(updatedProfile);
      };
    };
  };

  // --- Stat Allocation ---

  public shared ({ caller }) func allocateStats(statAllocations : [(Nat, Int)]) : async UserProfile {
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
        toUserProfile(updatedProfile);
      };
    };
  };

  // --- Missions ---

  public query ({ caller }) func listMissions() : async [Mission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list missions");
    };
    missions.values().toArray();
  };

  public query ({ caller }) func getMission(missionId : Text) : async ?Mission {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view missions");
    };
    missions.get(missionId);
  };

  public shared ({ caller }) func completeMission(missionId : Text) : async UserProfile {
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
              questionnaireAnswers = profile.questionnaireAnswers;
              completedDailyTasks = profile.completedDailyTasks;
              customTaskStatus = profile.customTaskStatus;
            };

            profiles.add(caller, updatedProfile);
            toUserProfile(updatedProfile);
          };
        };
      };
    };
  };

  // --- Skills ---

  public query ({ caller }) func listSkills() : async [Skill] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list skills");
    };
    skills.values().toArray();
  };

  public query ({ caller }) func getSkill(skillId : Text) : async ?Skill {
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

  public shared ({ caller }) func unlockSkill(skillId : Text) : async UserProfile {
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
              questionnaireAnswers = profile.questionnaireAnswers;
              completedDailyTasks = profile.completedDailyTasks;
              customTaskStatus = profile.customTaskStatus;
            };

            profiles.add(caller, updatedProfile);
            toUserProfile(updatedProfile);
          };
        };
      };
    };
  };

  // --- Remaining Functions ---

  public type DamageResult = {
    damage : Nat;
    stats : [Int];
  };

  public shared ({ caller }) func rollDie(sides : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can roll dice");
    };
    let randomInt = sides.toInt();
    switch (randomInt) {
      case (0) { 1 };
      case (nat) { nat.toNat() + 1 };
    };
  };

  public shared ({ caller }) func getDamage(damageStats : [Int]) : async DamageResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate damage");
    };

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

  public query ({ caller }) func getStatNames() : async StatNameArray {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stat names");
    };
    statNamesArray;
  };

  module Mob {
    public func compareByName(mob1 : Mob, mob2 : Mob) : Order.Order {
      Text.compare(mob1.name, mob2.name);
    };
  };

  public query ({ caller }) func listAllMobs() : async [Mob] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list mobs");
    };
    mobs.values().toArray().sort(Mob.compareByName);
  };

  public query ({ caller }) func listAllMobTypes() : async [(Nat, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list mob types");
    };
    mobTypeIndexMap.toArray();
  };

  public shared ({ caller }) func getMobStats(_mobTypeIndex : Nat, _level : Nat, _rangeRadius : Int) : async StatArray {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get mob stats");
    };

    let size = statNamesArray.size();

    let baseStats : StatArray = Array.tabulate<Int>(
      size,
      func(i) {
        if (i < 3) { 10 * (1 + (size - i : Nat)) } else { 6 * (1 + (size - i : Nat)) };
      },
    );

    baseStats;
  };

  public shared ({ caller }) func getStartingStats(pointPool : Int, _rangeMin : Int, _rangeMax : Int) : async StatArray {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get starting stats");
    };

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

  public shared ({ caller }) func getStatValue(_basicStats : StatArray, multipliers : StatArray, _statIndex : Nat) : async ?Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get stat values");
    };

    if (multipliers.size() != 10) {
      Runtime.trap("Input array must have exactly 10 elements. Received " # multipliers.size().toText());
    };
    ?multipliers[0];
  };

  public shared ({ caller }) func getDirectionFromCoordinates(_currentPosition : (Nat, Nat), _targetPosition : (Nat, Nat)) : async (Text, Text) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get directions");
    };
    return ("up", "north");
  };

  public shared ({ caller }) func addMission(mission : Mission) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add missions");
    };
    missions.add(mission.id, mission);
  };

  public shared ({ caller }) func addSkill(skill : Skill) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add skills");
    };
    skills.add(skill.id, skill);
  };

  public shared ({ caller }) func addDailyTask(task : DailyTask) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add daily tasks");
    };
    dailyTasks.add(task.id, task);
  };
};

