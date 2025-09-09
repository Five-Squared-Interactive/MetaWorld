// MetaWorld Client Modules.
this.configurationModule = null;
this.entityModule = null;
this.identityModule = null;
this.inputModule = null;
this.playerModule = null;
this.restModule = null;
this.scriptModule = null;
this.synchronizationModule = null;
this.uiModule = null;
this.worldRenderingModule = null;

// Query Parameter Information.
this.worldURI = null;
this.userID = null;
this.userTag = null;
this.token = null;
this.tokenExpiration = null;
this.interfaceMode = null;
this.runtimeMode = null;
this.thirdPersonCharacterModel = null;
this.thirdPersonCharacterOffset = Vector3.zero;
this.thirdPersonCharacterRotation = Quaternion.identity;
this.thirdPersonCharacterLabelOffset = Vector3.zero;
this.worldStartPos = Vector3.zero;
this.startPos = Vector3.zero;

function HandleQueryParams() {
    const tlc = Context.GetContext("MW_TOP_LEVEL_CONTEXT");
    tlc.worldURI = World.GetQueryParam("world_uri");
    //userTag = World.GetQueryParam("user_tag");
    //userID = World.GetQueryParam("user_id");
    tlc.interfaceMode = World.GetQueryParam("IF_MODE");
    if (interfaceMode === "desktop") {
        
    }
    else if (interfaceMode === "vr") {
        
    }
    else if (interfaceMode === "mobile") {
        
    }
    else {
        Logging.Log("Interface Mode not set or invalid. Defaulting to desktop.");
        tlc.interfaceMode = "desktop";
    }
    tlc.runtimeMode = World.GetQueryParam("RT_MODE");
    if (runtimeMode === "webgl") {
        
    }
    else if (runtimeMode === "focused") {
        
    }
    else {
        Logging.Log("Runtime Mode not set or invalid. Defaulting to webgl.");
        tlc.runtimeMode = "webgl";
    }
    tlc.thirdPersonCharacterModel = World.GetQueryParam("AVATAR_MODEL");
    var thirdPersonCharacterOffsetX = World.GetQueryParam("AVATAR_OFFSET_X");
    var thirdPersonCharacterOffsetY = World.GetQueryParam("AVATAR_OFFSET_Y");
    var thirdPersonCharacterOffsetZ = World.GetQueryParam("AVATAR_OFFSET_Z");
    if (thirdPersonCharacterOffsetX != null && thirdPersonCharacterOffsetY != null && thirdPersonCharacterOffsetZ != null) {
        tlc.thirdPersonCharacterOffset = new Vector3(thirdPersonCharacterOffsetX, thirdPersonCharacterOffsetY, thirdPersonCharacterOffsetZ);
    }
    var thirdPersonCharacterRotationX = World.GetQueryParam("AVATAR_ROT_X");
    var thirdPersonCharacterRotationY = World.GetQueryParam("AVATAR_ROT_Y");
    var thirdPersonCharacterRotationZ = World.GetQueryParam("AVATAR_ROT_Z");
    var thirdPersonCharacterRotationW = World.GetQueryParam("AVATAR_ROT_W");
    if (thirdPersonCharacterRotationX != null && thirdPersonCharacterRotationY != null
        && thirdPersonCharacterRotationZ != null && thirdPersonCharacterRotationW != null) {
        tlc.thirdPersonCharacterRotation = new Quaternion(thirdPersonCharacterRotationX,
            thirdPersonCharacterRotationY, thirdPersonCharacterRotationZ, thirdPersonCharacterRotationW);
    }
    var thirdPersonCharacterLabelOffsetX = World.GetQueryParam("AVATAR_LABEL_OFFSET_X");
    var thirdPersonCharacterLabelOffsetY = World.GetQueryParam("AVATAR_LABEL_OFFSET_Y");
    var thirdPersonCharacterLabelOffsetZ = World.GetQueryParam("AVATAR_LABEL_OFFSET_Z");
    if (thirdPersonCharacterLabelOffsetX != null && thirdPersonCharacterLabelOffsetY != null && thirdPersonCharacterLabelOffsetZ != null) {
        tlc.thirdPersonCharacterLabelOffset = new Vector3(thirdPersonCharacterLabelOffsetX, thirdPersonCharacterLabelOffsetY, thirdPersonCharacterLabelOffsetZ);
    }

    var worldPosX = World.GetQueryParam("WORLD_POS_X");
    var worldPosY = World.GetQueryParam("WORLD_POS_Y");
    var worldPosZ = World.GetQueryParam("WORLD_POS_Z");
    if (worldPosX != null && worldPosY != null && worldPosZ != null) {
        tlc.worldStartPos = new Vector3(worldPosX, worldPosY, worldPosZ);
    }
    else {
        // Set to a default.
    }

    var startXArg = 0;
    var startYArg = 512;
    var startZArg = 0;
    tlc.startXArg = World.GetQueryParam("start_x");
    tlc.startYArg = World.GetQueryParam("start_y");
    tlc.startZArg = World.GetQueryParam("start_z");
    if (startXArg != null && startYArg != null && startZArg != null) {
        tlc.startPos = new Vector3(parseFloat(startXArg), parseFloat(startYArg), parseFloat(startZArg));
    }
    //token = World.GetQueryParam("token");
}

function InitializeModules() {
    var tlc = Context.GetContext("MW_TOP_LEVEL_CONTEXT");

    tlc.userID = UUID.NewUUID().ToString();
    tlc.userTag = "Unregistered";


    tlc.configurationModule = new ConfigurationModule(tlc.worldURI, PerformPostWorldConfigLoadActions);
    tlc.entityModule = new EntityModule();
    tlc.identityModule = new IdentityModule(tlc.userID, tlc.userTag, tlc.token);
    tlc.inputModule = new InputModule();
    tlc.playerModule = new PlayerModule(tlc.userTag, tlc.startPos, tlc.interfaceMode,
        tlc.thirdPersonCharacterModel, tlc.thirdPersonCharacterOffset,
        tlc.thirdPersonCharacterRotation, tlc.thirdPersonCharacterLabelOffset);
    tlc.restModule = new RESTModule();
    tlc.scriptModule = new ScriptModule();
    tlc.synchronizationModule = new SynchronizationModule(playerModule);
    tlc.uiModule = new UIModule(tlc.runtimeMode);
    tlc.worldRenderingModule = new WorldRenderingModule(tlc.worldStartPos);

    GetWorldConfiguration();
}

function GetWorldConfiguration() {
    Logging.Log("Getting World Configuration...");

    var configModule = Context.GetContext("CONFIGURATION_MODULE");

    configModule.LoadWorldConfig();
}

function PerformPostWorldConfigLoadActions() {
    Logging.Log("Performing Post World Config Load Actions...");
    ConnectToGlobalSynchronizer();
    MW_UI_SetUpEditToolbar();
}

function PerformPostSynchronizerConnectActions() {
    Logging.Log("Performing Post Synchronizer Connect Actions...");
}

function PerformPostSessionJoinedActions() {
    Logging.Log("Performing Post Session Joined Actions...");
    MW_Rend_LoadWorld();
}

function ConnectToGlobalSynchronizer() {
    var configModule = Context.GetContext("CONFIGURATION_MODULE");
    var synchronizationModule = Context.GetContext("SYNCHRONIZATION_MODULE");

    synchronizationSession = {
        host: configModule.worldConfig["vos-synchronization-service"]["host"],
        port: configModule.worldConfig["vos-synchronization-service"]["port"],
        tls: configModule.worldConfig["vos-synchronization-service"]["tls"],
        transport: configModule.worldConfig["vos-synchronization-service"]["transport"]
    };

    sessionInfo = {
        id: configModule.worldConfig["vos-synchronization-service"]["global-session-id"],
        tag: configModule.worldConfig["vos-synchronization-service"]["global-session-tag"]
    };
    MW_Sync_ConnectToGlobalSynchronizer(synchronizationSession, sessionInfo,
        PerformPostSynchronizerConnectActions, PerformPostSessionJoinedActions);
}

function FinishLoginPanelSetup() {
    var loginContext = Context.GetContext("LOGIN_CONTEXT");
    var loginPanel = Entity.Get(WorldStorage.GetItem("LOGIN-PANEL-ID"));

    if (loginPanel == null) {
        Logging.Log("Login Panel not found. Cannot finish setup.");
        return;
    }

    loginPanel.SetInteractionState(InteractionState.Static);
    loginPanel.LoadFromURL('https://id.worldhub.me:35526/login');

    Context.DefineContext("LOGIN_CONTEXT", loginContext);
}

function HandleUserLoginMessage(message) {
    if (message.startsWith("WHID.AUTH.COMPLETE")) {
        var rawMsgParams = message.substring(message.indexOf("(") + 1, message.indexOf(")"));
        if (rawMsgParams == null) {
            Logging.LogError("HandleUserLoginMessage: Invalid Authentication Complete message received.");
            return;
        }

        var msgParams = rawMsgParams.split(",");
        if (msgParams.length != 4) {
            Logging.LogError("HandleToolbarMessage: Invalid Authentication Complete message received.");
            return;
        }
        
        var mwTopLevelContext = Context.GetContext("MW_TOP_LEVEL_CONTEXT");
        if (mwTopLevelContext == null) {
            Logging.LogError("MW_TOP_LEVEL_CONTEXT not found. Cannot handle user login message.");
            return;
        }

        mwTopLevelContext.userID = msgParams[0];
        mwTopLevelContext.userTag = msgParams[1];
        mwTopLevelContext.token = msgParams[2];
        mwTopLevelContext.tokenExpiration = msgParams[3];
        Context.DefineContext("MW_TOP_LEVEL_CONTEXT", mwTopLevelContext);

        var loginCanvas = Entity.Get(WorldStorage.GetItem("LOGIN-CANVAS-ID"));
        loginCanvas.SetInteractionState(InteractionState.Hidden);

        HandleQueryParams();
        InitializeModules();
    }
}

function FinishLoginCanvasSetup() {
    var loginContext = Context.GetContext("LOGIN_CONTEXT");

    var loginCanvas = Entity.Get(WorldStorage.GetItem("LOGIN-CANVAS-ID"));
    loginCanvas.SetInteractionState(InteractionState.Static);
        loginCanvas.MakeScreenCanvas();
    var loginPanel = HTMLEntity.Create(loginCanvas, new Vector2(0, 0), new Vector2(1, 1),
        WorldStorage.GetItem("LOGIN-PANEL-ID"), "UserLoginPanel", "HandleUserLoginMessage", "FinishLoginPanelSetup");
    
    Context.DefineContext("LOGIN_CONTEXT", loginContext);
}

function StartUserLogin() {
    Logging.Log("Starting User Login...");

    var loginContext = {};
    WorldStorage.SetItem("LOGIN-CANVAS-ID", UUID.NewUUID().ToString());
    WorldStorage.SetItem("LOGIN-PANEL-ID", UUID.NewUUID().ToString());


    loginContext.loginCanvas = CanvasEntity.Create(null, Vector3.zero, Quaternion.identity,
        Vector3.one, false, WorldStorage.GetItem("LOGIN-CANVAS-ID"), "LoginCanvas", "FinishLoginCanvasSetup");
    
    Context.DefineContext("LOGIN_CONTEXT", loginContext);
}

Context.DefineContext("MW_TOP_LEVEL_CONTEXT", this);

MW_UI_ToggleViewMenu();
MW_Input_Touch_SetTouchControls();

//StartUserLogin();

HandleQueryParams();
InitializeModules();
