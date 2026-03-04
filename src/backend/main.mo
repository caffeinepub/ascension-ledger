import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";



actor {
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

  public type Mission = {
    id : Text;
    name : Text;
    description : Text;
    xpReward : Nat;
    coinReward : Nat;
    missionType : { #daily; #repeatable };
  };

  public type UserMission = {
    id : Text;
    name : Text;
    description : Text;
    xpReward : Nat;
    coinReward : Nat;
    missionType : { #daily; #repeatable };
    createdBy : Principal;
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

  public type DisciplineSkill = {
    id : Text;
    name : Text;
    description : Text;
    requiredLevel : Nat;
  };

  public type CooldownArray = [(Text, Time.Time)];
  public type UserProfile = {
    nickname : Text;
    avatarChoice : Text;
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
    avatarChoice : Text;
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

  public type LeaderboardEntry = {
    principal : Principal;
    nickname : Text;
    avatarChoice : Text;
    level : Nat;
  };

  type DailyTaskEntry = {
    task : DailyTask;
    completionTime : Time.Time;
  };

  type CheatItem = {
    id : Text;
    name : Text;
    description : Text;
    creditCost : Nat;
    dailyLimit : Nat;
  };

  type CheatPurchase = {
    userId : Principal;
    cheatId : Text;
    purchaseDate : Time.Time;
    dailyCount : Nat;
  };

  type PurchaseResult = {
    #success;
    #insufficientCredits;
    #dailyLimitReached;
    #itemNotFound;
    #unauthorized;
  };

  let cheatItems = [
    {
      id = "doomscrolling";
      name = "30 Min Doomscrolling/Gaming";
      description = "Indulge in 30 minutes of guilty pleasure doomscrolling or gaming to reset your brain after sustained focus. Use in moderation!";
      creditCost = 50;
      dailyLimit = 2;
    },
    {
      id = "junk_food";
      name = "Junk Food Treat";
      description = "Enjoy a small portion of your favorite junk food as a reward for healthy eating overall. Use this sparingly!";
      creditCost = 20;
      dailyLimit = 2;
    },
    {
      id = "power_nap";
      name = "20 Min Power Nap";
      description = "Take a 20 minute power nap to recharge your energy levels and boost productivity. Avoid using within 4 hours of sleep.";
      creditCost = 10;
      dailyLimit = 2;
    },
    {
      id = "show_episode";
      name = "One Episode of a Show";
      description = "Watch a single episode (30-60 min) of your favorite TV show guilt-free. Don't binge - stick to just one!";
      creditCost = 30;
      dailyLimit = 2;
    },
    {
      id = "youtube";
      name = "40 Min YouTube Guilt-Free";
      description = "Spend up to 40 minutes watching YouTube for entertainment or learning purposes. Avoid endless scrolling.";
      creditCost = 10;
      dailyLimit = 2;
    },
    {
      id = "movie_night";
      name = "Full Movie Night";
      description = "Enjoy a complete movie night experience at home, including snacks and drinks. Make it a social event if possible.";
      creditCost = 40;
      dailyLimit = 1;
    },
    {
      id = "skip_task";
      name = "Skip-One-Low-Priority-Task Pass";
      description = "Skip a single, non-critical task without feeling guilty. Limit to one use per task.";
      creditCost = 30;
      dailyLimit = 2;
    },
    {
      id = "cozy_reset";
      name = "Cozy Reset Break";
      description = "Take a 1-2 hour break to do something relaxing and comforting, like reading, listening to music, or taking a bath.";
      creditCost = 80;
      dailyLimit = 1;
    },
    {
      id = "full_rest";
      name = "Full Rest Evening";
      description = "Take an entire evening (4-6 hours) of guilt-free rest with zero study or work obligations. Fully recharge for the next day.";
      creditCost = 100;
      dailyLimit = 1;
    },
  ];

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
  let userMissions = Map.empty<Text, UserMission>();
  let skills : Map.Map<Text, Skill> = Map.empty();
  let disciplineSkills : Map.Map<Text, DisciplineSkill> = Map.empty();

  let dailyTasks = Map.empty<Text, DailyTask>();
  var customTasks = Map.empty<Principal, Map.Map<Text, CustomTask>>();
  let taskCompletionLog = Map.empty<Principal, Map.Map<Text, Text>>();
  let dailyTaskHistory = Map.empty<Principal, List.List<DailyTaskEntry>>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let MAX_ATTRIBUTE_POINTS_PER_TASK : Nat = 10;
  let MAX_USER_MISSION_XP_REWARD : Nat = 500;
  let MAX_USER_MISSION_COIN_REWARD : Nat = 500;

  func isSameDay(timestamp1 : Time.Time, timestamp2 : Time.Time) : Bool {
    let day1 = timestamp1 / 86_400_000_000_000;
    let day2 = timestamp2 / 86_400_000_000_000;
    day1 == day2;
  };

  func hasCompletedTaskToday(user : Principal, taskId : Text, currentTime : Time.Time) : Bool {
    switch (taskCompletionLog.get(user)) {
      case (null) { false };
      case (?userLog) {
        switch (userLog.get(taskId)) {
          case (null) { false };
          case (?timestampStr) {
            let taskTimestamp = switch (Int.fromText(timestampStr)) {
              case (null) { return false };
              case (?t) { t };
            };
            isSameDay(taskTimestamp, currentTime);
          };
        };
      };
    };
  };

  func logTaskCompletion(user : Principal, taskId : Text, timestamp : Time.Time) {
    let currentLog = switch (taskCompletionLog.get(user)) {
      case (null) {
        let newLog = Map.empty<Text, Text>();
        taskCompletionLog.add(user, newLog);
        newLog;
      };
      case (?log) { log };
    };
    currentLog.add(taskId, timestamp.toText());
  };

  func initializeMissionsAndSkills() {
    missions.add("daily_training", {
      id = "daily_training";
      name = "Daily Training";
      description = "Complete your daily training routine";
      xpReward = 100;
      coinReward = 50;
      missionType = #daily;
    });

    missions.add("hunt_goblins", {
      id = "hunt_goblins";
      name = "Hunt Goblins";
      description = "Defeat goblins in the forest";
      xpReward = 50;
      coinReward = 25;
      missionType = #repeatable;
    });

    missions.add("task_management", {
      id = "task_management";
      name = "Task Management";
      description = "Organize and prioritize your daily tasks for increased productivity";
      xpReward = 80;
      coinReward = 40;
      missionType = #repeatable;
    });

    missions.add("health_checkup", {
      id = "health_checkup";
      name = "Health Checkup";
      description = "Schedule a regular health checkup to monitor your physical well-being";
      xpReward = 150;
      coinReward = 75;
      missionType = #repeatable;
    });

    missions.add("fitness_challenge", {
      id = "fitness_challenge";
      name = "Fitness Challenge";
      description = "Participate in a fitness challenge to improve your strength and stamina";
      xpReward = 200;
      coinReward = 100;
      missionType = #repeatable;
    });

    missions.add("social_community_engagement", {
      id = "social_community_engagement";
      name = "Social Community Engagement";
      description = "Engage in community activities to foster social awareness and connection";
      xpReward = 120;
      coinReward = 60;
      missionType = #repeatable;
    });

    missions.add("balanced_diet", {
      id = "balanced_diet";
      name = "Balanced Diet";
      description = "Maintain a balanced diet to support your overall health and energy levels";
      xpReward = 90;
      coinReward = 45;
      missionType = #repeatable;
    });

    missions.add("daily_meditation", {
      id = "daily_meditation";
      name = "Daily Meditation";
      description = "Practice daily meditation for improved mental health and clarity";
      xpReward = 60;
      coinReward = 30;
      missionType = #repeatable;
    });

    missions.add("financial_planning", {
      id = "financial_planning";
      name = "Financial Planning";
      description = "Plan your finances to increase wealth and stability";
      xpReward = 180;
      coinReward = 90;
      missionType = #repeatable;
    });

    skills.add("strength_training", {
      id = "strength_training";
      name = "Strength Training";
      description = "Increases your physical strength and endurance";
      requirements = {
        minLevel = 2;
        minStats = [(2, 15)];
      };
    });

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

    skills.add("active_listening", {
      id = "active_listening";
      name = "Active Listening";
      description = "Enhances communication and understanding in conversations";
      requirements = {
        minLevel = 2;
        minStats = [(7, 10)];
      };
    });

    skills.add("creative_writing", {
      id = "creative_writing";
      name = "Creative Writing";
      description = "Improves your ability to express ideas creatively";
      requirements = {
        minLevel = 2;
        minStats = [(1, 12)];
      };
    });

    skills.add("budgeting", {
      id = "budgeting";
      name = "Budgeting";
      description = "Teaches financial planning and money management";
      requirements = {
        minLevel = 2;
        minStats = [(11, 10)];
      };
    });

    skills.add("nutrition_knowledge", {
      id = "nutrition_knowledge";
      name = "Nutrition Knowledge";
      description = "Enhances understanding of healthy eating habits";
      requirements = {
        minLevel = 2;
        minStats = [(3, 10)];
      };
    });

    skills.add("speed_reading", {
      id = "speed_reading";
      name = "Speed Reading";
      description = "Improves reading comprehension and speed";
      requirements = {
        minLevel = 2;
        minStats = [(0, 12)];
      };
    });

    skills.add("time_management", {
      id = "time_management";
      name = "Time Management";
      description = "Enhances productivity and efficiency";
      requirements = {
        minLevel = 2;
        minStats = [(6, 12)];
      };
    });

    // Discipline Skill Entries (Added in Batches)
    disciplineSkills.add("core_discipline_skills", {
      id = "core_discipline_skills";
      name = "Core Discipline Skills";
      description = "Foundation of all productive habits; mastering basic self-control and daily routine adherence.";
      requiredLevel = 1;
    });

    disciplineSkills.add("discipline_master", {
      id = "discipline_master";
      name = "Discipline Master";
      description = "Advanced command over personal discipline; consistently choosing long-term gains over short-term comfort.";
      requiredLevel = 10;
    });

    disciplineSkills.add("consistency_king_queen", {
      id = "consistency_king_queen";
      name = "Consistency King / Queen";
      description = "Executing tasks with unwavering regularity; showing up every day regardless of motivation.";
      requiredLevel = 8;
    });

    disciplineSkills.add("iron_will", {
      id = "iron_will";
      name = "Iron Will";
      description = "Unyielding mental resolve; pushing through resistance, fatigue, and adversity without compromise.";
      requiredLevel = 12;
    });

    disciplineSkills.add("focus_architect", {
      id = "focus_architect";
      name = "Focus Architect";
      description = "Designing environments and routines that maximise deep concentration and eliminate distraction.";
      requiredLevel = 9;
    });
  };

  initializeMissionsAndSkills();

  func calculateXpToNextLevel(level : Nat) : Nat {
    let baseXp = 100;
    var xpNeeded = baseXp * level;
    if (level > 10) { xpNeeded *= level };
    xpNeeded;
  };

  func createDefaultProfile(_caller : Principal, nickname : Text) : UserProfileInternal {
    let startingStats = Array.tabulate<Int>(13, func(_) { 10 });
    {
      nickname;
      avatarChoice = "";
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
      avatarChoice = internal.avatarChoice;
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

  let MIDNIGHT_INTERVAL_NANOS : Nat = 86_400_000_000_000;

  public shared ({ caller }) func createCustomTask(title : Text, points : Nat, attributePoints : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create custom tasks");
    };

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

    let userTasks = switch (customTasks.get(caller)) {
      case (null) { Runtime.trap("No custom tasks found for user") };
      case (?tasks) { tasks };
    };

    switch (userTasks.get(taskId)) {
      case (null) { Runtime.trap("Custom task not found: " # taskId) };
      case (?_task) {
        userTasks.remove(taskId);
      };
    };
  };

  public shared ({ caller }) func toggleCustomTaskCompletion(taskId : Text, completed : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can toggle custom task completion");
    };

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

        if (completed and not previousStatus) {
          updatedXp += task.points;
          updatedCoins += task.points;
          updatedUnspentPoints += task.attributePoints;

          while (updatedXp >= xpToNext) {
            updatedXp -= xpToNext;
            updatedLevel += 1;
            updatedUnspentPoints += 5;
            xpToNext := calculateXpToNextLevel(updatedLevel);
          };
        };

        let updatedProfile : UserProfileInternal = {
          nickname = profile.nickname;
          avatarChoice = profile.avatarChoice;
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
        profiles.remove(caller);
        customTasks.remove(caller);
      };
    };
  };

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
        switch (completedToday.find<Text>(func(id) { id == task.id })) {
          case (null) { true };
          case (?_) { false };
        };
      }
    );
    {
      completed = allTasks.filter<DailyTask>(func(task) {
        switch (completedToday.find<Text>(func(id) { id == task.id })) {
          case (null) { false };
          case (?_) { true };
        };
      });
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

    var updatedXp = profile.xp + task.xpReward;
    var updatedCoins = profile.coins + task.coinReward;
    var updatedLevel = profile.level;
    var updatedUnspentPoints = profile.unspentStatPoints;
    var xpToNext = profile.xpToNextLevel;

    while (updatedXp >= xpToNext) {
      updatedXp -= xpToNext;
      updatedLevel += 1;
      updatedUnspentPoints += 5;
      xpToNext := calculateXpToNextLevel(updatedLevel);
    };

    let updatedCompletionTimes = profile.lastMissionCompletionTime;
    updatedCompletionTimes.add(taskId, today);

    let alreadyInList = switch (profile.completedDailyTasks.find(func(id) { id == taskId })) {
      case (null) { false };
      case (?_) { true };
    };
    let updatedCompletedTasks = if (not alreadyInList) {
      let completedTasks = profile.completedDailyTasks;
      Array.tabulate(completedTasks.size() + 1, func(i) {
        if (i < completedTasks.size()) { completedTasks[i] } else { taskId }
      });
    } else {
      profile.completedDailyTasks;
    };

    // Record task completion in dailyTaskHistory
    let entry : DailyTaskEntry = {
      task;
      completionTime = today;
    };
    let existingHistory = switch (dailyTaskHistory.get(caller)) {
      case (null) { List.empty<DailyTaskEntry>() };
      case (?history) { history };
    };

    existingHistory.add(entry);
    dailyTaskHistory.add(caller, existingHistory);

    let updatedProfile : UserProfileInternal = {
      nickname = profile.nickname;
      avatarChoice = profile.avatarChoice;
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
      completedDailyTasks = profile.completedDailyTasks;
      customTaskStatus = profile.customTaskStatus;
    };

    profiles.add(caller, updatedProfile);
  };

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
      avatarChoice = profile.avatarChoice;
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
          avatarChoice = profile.avatarChoice;
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

            let alreadyCompleted = switch (profile.completedMissions.find(func(id) { id == missionId })) {
              case (null) { false };
              case (?_) { true };
            };
            let newCompletedMissions = if (not alreadyCompleted) {
              let completedMissions = profile.completedMissions;
              Array.tabulate(completedMissions.size() + 1, func(i) { if (i < completedMissions.size()) { completedMissions[i] } else { missionId } });
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
              avatarChoice = profile.avatarChoice;
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

  public query ({ caller }) func listDisciplineSkills() : async [DisciplineSkill] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list discipline skills");
    };
    disciplineSkills.values().toArray();
  };

  public query ({ caller }) func getDisciplineSkill(skillId : Text) : async ?DisciplineSkill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view discipline skill details");
    };
    disciplineSkills.get(skillId);
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
            switch (profile.unlockedSkills.find<Text>(func(id) { id == skillId })) {
              case (null) {};
              case (?_) { Runtime.trap("Skill already unlocked: " # skillId) };
            };

            if (not canUnlockSkill(profile, skill)) {
              Runtime.trap("Requirements not met for skill: " # skillId);
            };

            let unlockedSkills = profile.unlockedSkills;
            let newUnlockedSkills = Array.tabulate(unlockedSkills.size() + 1, func(i) { if (i < unlockedSkills.size()) { unlockedSkills[i] } else { skillId } });

            let updatedProfile : UserProfileInternal = {
              nickname = profile.nickname;
              avatarChoice = profile.avatarChoice;
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
      case (nat) { Int.abs(nat) + 1 };
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
    for ((i, stat) in damageStats.enumerate<Int>()) {
      if (stat > 0) { damage += (size - i : Nat) * Int.abs(stat) };
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
    public func compareByName(mob1 : Mob, mob2 : Mob) : { #less; #equal; #greater } {
      Text.compare(mob1.name, mob2.name);
    };
  };

  public query ({ caller }) func listAllMobs() : async [Mob] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list mobs");
    };
    mobs.values().toArray().sort<Mob>(Mob.compareByName);
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
    let defaultStatPoints = pointPool / (size.toInt());

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

  public shared ({ caller }) func createUserMission(title : Text, description : Text, xpReward : Nat, coinReward : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create missions");
    };

    if (title.isEmpty() or description.isEmpty()) {
      Runtime.trap("Mission title and description cannot be empty");
    };

    if (xpReward > MAX_USER_MISSION_XP_REWARD) {
      Runtime.trap("XP reward cannot exceed " # MAX_USER_MISSION_XP_REWARD.toText());
    };

    if (coinReward > MAX_USER_MISSION_COIN_REWARD) {
      Runtime.trap("Coin reward cannot exceed " # MAX_USER_MISSION_COIN_REWARD.toText());
    };

    if (xpReward == 0 or coinReward == 0) {
      Runtime.trap("Rewards must be positive values");
    };

    let missionId = "user_mission_" # caller.toText() # "_" # Time.now().toText();
    let userMission : UserMission = {
      id = missionId;
      name = title;
      description;
      xpReward;
      coinReward;
      missionType = #repeatable;
      createdBy = caller;
    };

    userMissions.add(missionId, userMission);
    missionId;
  };

  public query ({ caller }) func listUserMissions() : async [UserMission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list user missions");
    };
    userMissions.values().toArray();
  };

  public query ({ caller }) func getUserMission(missionId : Text) : async ?UserMission {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user missions");
    };
    userMissions.get(missionId);
  };

  public shared ({ caller }) func completeUserMission(missionId : Text) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete user missions");
    };

    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found. Please initialize your profile first.") };
      case (?profile) {
        switch (userMissions.get(missionId)) {
          case (null) { Runtime.trap("User mission not found: " # missionId) };
          case (?mission) {
            let newCompletionTimes = profile.lastMissionCompletionTime;
            newCompletionTimes.add(missionId, Time.now());

            let alreadyCompleted = switch (profile.completedMissions.find(func(id) { id == missionId })) {
              case (null) { false };
              case (?_) { true };
            };
            let newCompletedMissions = if (not alreadyCompleted) {
              let completedMissions = profile.completedMissions;
              Array.tabulate(completedMissions.size() + 1, func(i) {
                if (i < completedMissions.size()) { completedMissions[i] } else { missionId }
              });
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
              avatarChoice = profile.avatarChoice;
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

  public shared ({ caller }) func deleteUserMission(missionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete user missions");
    };

    switch (userMissions.get(missionId)) {
      case (null) { Runtime.trap("User mission not found: " # missionId) };
      case (?mission) {
        if (mission.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own missions");
        };
        userMissions.remove(missionId);
      };
    };
  };

  // Returns leaderboard data for all registered users.
  // This is public information accessible to everyone including guests,
  // as it only exposes the principal, nickname, avatar choice, and level.
  public query func getLeaderboard() : async [LeaderboardEntry] {
    profiles.toArray().map(func((principal, profile)) {
      {
        principal;
        nickname = profile.nickname;
        avatarChoice = profile.avatarChoice;
        level = profile.level;
      };
    });
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all user profiles");
    };
    profiles.toArray().map(func((principal, profile)) { (principal, toUserProfile(profile)) });
  };

  // BEGIN CHEAT STORE IMPLEMENTATION

  let purchaseHistory = Map.empty<Principal, Map.Map<Text, CheatPurchase>>();

  public query ({ caller }) func getCheatItems() : async [CheatItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cheat items");
    };
    cheatItems;
  };

  public shared ({ caller }) func purchaseCheat(cheatId : Text) : async PurchaseResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #unauthorized;
    };

    let cheatItem = switch (cheatItems.find(func(item) { item.id == cheatId })) {
      case (null) { return #itemNotFound };
      case (?item) { item };
    };

    let userProfile = switch (profiles.get(caller)) {
      case (null) { return #unauthorized };
      case (?profile) { profile };
    };

    if (userProfile.coins < cheatItem.creditCost) {
      return #insufficientCredits;
    };

    let today = Time.now();
    let midnightTime = today / MIDNIGHT_INTERVAL_NANOS * MIDNIGHT_INTERVAL_NANOS;

    let dailyPurchases = switch (purchaseHistory.get(caller)) {
      case (null) { 0 };
      case (?userPurchases) {
        switch (userPurchases.get(cheatId)) {
          case (null) { 0 };
          case (?purchase) {
            if (isSameDay(purchase.purchaseDate, today)) {
              purchase.dailyCount;
            } else { 0 };
          };
        };
      };
    };

    if (dailyPurchases >= cheatItem.dailyLimit) { return #dailyLimitReached };

    let updatedPurchases = switch (purchaseHistory.get(caller)) {
      case (null) {
        let newPurchases = Map.empty<Text, CheatPurchase>();
        purchaseHistory.add(caller, newPurchases);
        newPurchases;
      };
      case (?userPurchases) { userPurchases };
    };

    let newPurchase : CheatPurchase = {
      userId = caller;
      cheatId;
      purchaseDate = midnightTime;
      dailyCount = dailyPurchases + 1;
    };

    updatedPurchases.add(cheatId, newPurchase);

    let updatedProfile : UserProfileInternal = {
      nickname = userProfile.nickname;
      avatarChoice = userProfile.avatarChoice;
      level = userProfile.level;
      xp = userProfile.xp;
      xpToNextLevel = userProfile.xpToNextLevel;
      stats = userProfile.stats;
      unspentStatPoints = userProfile.unspentStatPoints;
      inventory = userProfile.inventory;
      coins = userProfile.coins - cheatItem.creditCost;
      completedMissions = userProfile.completedMissions;
      lastMissionCompletionTime = userProfile.lastMissionCompletionTime;
      unlockedSkills = userProfile.unlockedSkills;
      questionnaireAnswers = userProfile.questionnaireAnswers;
      completedDailyTasks = userProfile.completedDailyTasks;
      customTaskStatus = userProfile.customTaskStatus;
    };

    profiles.add(caller, updatedProfile);
    #success;
  };

  public query ({ caller }) func getUserCheatPurchasesToday() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cheat purchases");
    };

    let today = Time.now();
    let purchases = switch (purchaseHistory.get(caller)) {
      case (null) { [] };
      case (?userPurchases) {
        userPurchases.toArray().filter(
          func((cheatId, purchase)) { isSameDay(purchase.purchaseDate, today) }
        ).map(
          func((cheatId, purchase)) { (cheatId, purchase.dailyCount) }
        );
      };
    };

    purchases;
  };
};

