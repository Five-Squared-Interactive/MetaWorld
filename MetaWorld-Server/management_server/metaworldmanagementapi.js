const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { argv } = require('process');
const app = express();

let config = { };

app.use(cors({
    origin: "*",
    methods: "GET"
}));

app.use(express.json({ limit: "100mb" }));
app.use(express.raw({ type: "application/octet-stream", limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

app.get('/getmodellisting', (req, res) => {
    models = fs.readdirSync(config["model_directory"]);
    res.send(JSON.stringify(models));
});

app.post('/addmodel', (req, res) => {
    result = {
        "success": false
    };

    json = JSON.parse(req.query.request);
    modelPath = path.join(config["model_directory"], json["model-name"]);

    fs.writeFileSync(modelPath, req.body)
    result.success = true;

    res.send(JSON.stringify(result));
});

app.get('/deletemodel', (req, res) => {
    result = {
        "success": false
    };

    modelPath = path.join(config["model_directory"], JSON.parse(req.query.request)["model-name"]);

    // TODO: DANGEROUS.
    if (fs.existsSync(modelPath)) {
        fs.rmSync(modelPath);
        result.success = true;
    }
    res.send(JSON.stringify(result));
});

app.get('/renamemodel', (req, res) => {
    result = {
        "success": false
    };

    oldModelPath = path.join(config["model_directory"], JSON.parse(req.query.request)["old-model-name"]);
    newModelPath = path.join(config["model_directory"], JSON.parse(req.query.request)["new-model-name"]);

    // TODO: DANGEROUS.
    if (fs.existsSync(oldModelPath)) {
        fs.renameSync(oldModelPath, newModelPath);
        result.success = true;
    }
    res.send(JSON.stringify(result));
});

app.get('/gettexturelisting', (req, res) => {
    textures = fs.readdirSync(config["texture_directory"]);
    res.send(JSON.stringify(textures));
});

app.post('/addtexture', (req, res) => {
    result = {
        "success": false
    };

    json = JSON.parse(req.query.request);
    texturePath = path.join(config["texture_directory"], json["texture-name"]);

    fs.writeFileSync(texturePath, req.body)
    result.success = true;

    res.send(JSON.stringify(result));
});

app.get('/deletetexture', (req, res) => {
    result = {
        "success": false
    };

    texturePath = path.join(config["texture_directory"], JSON.parse(req.query.request)["texture-name"]);

    // TODO: DANGEROUS.
    if (fs.existsSync(texturePath)) {
        fs.rmSync(texturePath);
        result.success = true;
    }
    res.send(JSON.stringify(result));
});

app.get('/renametexture', (req, res) => {
    result = {
        "success": false
    };

    oldTexturePath = path.join(config["texture_directory"], JSON.parse(req.query.request)["old-texture-name"]);
    newTexturePath = path.join(config["texture_directory"], JSON.parse(req.query.request)["new-texture-name"]);

    // TODO: DANGEROUS.
    if (fs.existsSync(oldTexturePath)) {
        fs.renameSync(oldTexturePath, newTexturePath);
        result.success = true;
    }
    res.send(JSON.stringify(result));
});

app.get('/getthumbnaillisting', (req, res) => {
    thumbnails = fs.readdirSync(config["thumbnail_directory"]);
    res.send(JSON.stringify(thumbnails));
});

app.post('/addthumbnail', (req, res) => {
    result = {
        "success": false
    };

    json = JSON.parse(req.query.request);
    thumbnailPath = path.join(config["thumbnail_directory"], json["thumbnail-name"]);

    fs.writeFileSync(thumbnailPath, req.body)
    result.success = true;

    res.send(JSON.stringify(result));
});

app.get('/deletethumbnail', (req, res) => {
    result = {
        "success": false
    };

    thumbnailPath = path.join(config["thumbnail_directory"], JSON.parse(req.query.request)["thumbnail-name"]);

    // TODO: DANGEROUS.
    if (fs.existsSync(thumbnailPath)) {
        fs.rmSync(thumbnailPath);
        result.success = true;
    }
    res.send(JSON.stringify(result));
});

app.get('/renamethumbnail', (req, res) => {
    result = {
        "success": false
    };

    oldThumbnailPath = path.join(config["thumbnail_directory"], JSON.parse(req.query.request)["old-thumbnail-name"]);
    newThumbnailPath = path.join(config["thumbnail_directory"], JSON.parse(req.query.request)["new-thumbnail-name"]);

    // TODO: DANGEROUS.
    if (fs.existsSync(oldThumbnailPath)) {
        fs.renameSync(oldThumbnailPath, newThumbnailPath);
        result.success = true;
    }
    res.send(JSON.stringify(result));
});

app.get('/getbiomelisting', (req, res) => {
    currentBiomeSettings = GetCurrentBiomeSettings();
    res.send(currentBiomeSettings);
});

app.get('/getbiomebyid', (req, res) => {
    res.send('Welcome to the Express.js Tutorial');
});

app.get('/removebiome', (req, res) => {
    result = {
        "success": false
    };

    newBiomeSettings = JSON.parse(GetCurrentBiomeSettings().toString());

    info = JSON.parse(req.query.request);

    delete newBiomeSettings.biomes[info.id];

    result.success = true;
    serializedProperties = JSON.stringify(newBiomeSettings);
    fs.writeFileSync(config["biome_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/updatebiomeproperties', (req, res) => {
    result = {
        "success": false
    };

    newBiomeSettings = JSON.parse(GetCurrentBiomeSettings().toString());

    info = JSON.parse(req.query.newproperties);

    if (info.id != info.oldid) {
        newBiomeSettings.biomes[info.id] = newBiomeSettings.biomes[info.oldid];
        delete newBiomeSettings.biomes[info.oldid];
    }
    newBiomeSettings.biomes[info.id]["id"] = info.id;
    newBiomeSettings.biomes[info.id]["name"] = info.name;
    newBiomeSettings.biomes[info.id]["temperature"] = info.temperature;
    newBiomeSettings.biomes[info.id]["moisture"] = info.moisture;
    newBiomeSettings.biomes[info.id]["terrain-variability"] = info["terrain-variability"];

    result.success = true;
    serializedProperties = JSON.stringify(newBiomeSettings);
    fs.writeFileSync(config["biome_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/updatebiometerrainlayer', (req, res) => {
    result = {
        "success": false
    };

    newBiomeSettings = JSON.parse(GetCurrentBiomeSettings().toString());

    info = JSON.parse(req.query.newproperties);
    
    if (info.layername != info.oldname) {
        newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.layername]
            = newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.oldname];
        delete newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.oldname];
    }
    newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.layername]["layer"] = info.id;
    newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.layername]["name"] = info.layername;
    newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.layername]["temperature"] = info.temperature;
    newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.layername]["color_texture"] = info["color-texture"];
    newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.layername]["normal-texture"] = info["normal_texture"];

    result.success = true;
    serializedProperties = JSON.stringify(newBiomeSettings);
    fs.writeFileSync(config["biome_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/addbiometerrainlayer', (req, res) => {
    result = {
        "success": false
    };

    newBiomeSettings = JSON.parse(GetCurrentBiomeSettings().toString());

    info = JSON.parse(req.query.newproperties);
    
    newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.layername] = {};
    newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.layername]["layer"] = info.id;
    newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.layername]["name"] = info.layername;
    newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.layername]["temperature"] = info.temperature;
    newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.layername]["color_texture"] = info["color-texture"];
    newBiomeSettings.biomes[info.biomeid]["terrain-materials"][info.layername]["normal-texture"] = info["normal_texture"];

    result.success = true;
    serializedProperties = JSON.stringify(newBiomeSettings);
    fs.writeFileSync(config["biome_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/removebiometerrainlayer', (req, res) => {
    result = {
        "success": false
    };

    newBiomeSettings = JSON.parse(GetCurrentBiomeSettings().toString());

    info = JSON.parse(req.query.properties);
    
    delete newBiomeSettings.biomes[info.id]["terrain-materials"][info.layername];

    result.success = true;
    serializedProperties = JSON.stringify(newBiomeSettings);
    fs.writeFileSync(config["biome_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/updatebiomegenerationlayer', (req, res) => {
    result = {
        "success": false
    };

    newBiomeSettings = JSON.parse(GetCurrentBiomeSettings().toString());

    info = JSON.parse(req.query.newproperties);
    
    if (info.oldgenerationlayer != info.generationlayer) {
        newBiomeSettings.biomes[info.biomeid]["terrain-layers"][info.generationlayer]
            = newBiomeSettings.biomes[info.biomeid]["terrain-layers"][info.oldgenerationlayer];
        delete newBiomeSettings.biomes[info.biomeid]["terrain-layers"][info.oldgenerationlayer];
    }
    newBiomeSettings.biomes[info.biomeid]["terrain-layers"][info.generationlayer]["layer"] = info.terrainlayer;
    newBiomeSettings.biomes[info.biomeid]["terrain-layers"][info.generationlayer]["max-height"] = info.maxheight;

    result.success = true;
    serializedProperties = JSON.stringify(newBiomeSettings);
    fs.writeFileSync(config["biome_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/addbiomegenerationlayer', (req, res) => {
    result = {
        "success": false
    };

    newBiomeSettings = JSON.parse(GetCurrentBiomeSettings().toString());

    info = JSON.parse(req.query.newproperties);
    
    newBiomeSettings.biomes[info.biomeid]["terrain-layers"][info.generationlayer] = {};
    newBiomeSettings.biomes[info.biomeid]["terrain-layers"][info.generationlayer]["layer"] = info.terrainlayer;
    newBiomeSettings.biomes[info.biomeid]["terrain-layers"][info.generationlayer]["max-height"] = Number(info.maxheight);

    result.success = true;
    serializedProperties = JSON.stringify(newBiomeSettings);
    fs.writeFileSync(config["biome_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/removebiomegenerationlayer', (req, res) => {
    result = {
        "success": false
    };

    newBiomeSettings = JSON.parse(GetCurrentBiomeSettings().toString());

    info = JSON.parse(req.query.properties);
    
    delete newBiomeSettings.biomes[info.biomeid]["terrain-layers"][info.generationlayer];

    result.success = true;
    serializedProperties = JSON.stringify(newBiomeSettings);
    fs.writeFileSync(config["biome_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.post('/updatebiomefoliage', (req, res) => {
    result = {
        "success": false
    };

    newBiomeSettings = JSON.parse(GetCurrentBiomeSettings().toString());

    info = JSON.parse(req.query.newproperties);

    newBiomeSettings.biomes[info.biomeid]["large-flora-entities"] = req.body["large-flora-entities"];
    newBiomeSettings.biomes[info.biomeid]["medium-flora-entities"] = req.body["medium-flora-entities"];
    newBiomeSettings.biomes[info.biomeid]["small-flora-entities"] = req.body["small-flora-entities"];
    newBiomeSettings.biomes[info.biomeid]["large-flora"] = info.largelikelihood;
    newBiomeSettings.biomes[info.biomeid]["medium-flora"] = info.mediumlikelihood;
    newBiomeSettings.biomes[info.biomeid]["small-flora"] = info.smalllikelihood;

    result.success = true;
    serializedProperties = JSON.stringify(newBiomeSettings);
    fs.writeFileSync(config["biome_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/getworldproperties', (req, res) => {
    currentProperties = GetCurrentWorldProperties();
    res.send(currentProperties);
});

app.get('/getworldtime', (req, res) => {
    currentTime = GetCurrentWorldTime();
    res.send(time);
});

app.get('/updateworldproperties', (req, res) => {
    result = {
        "success": false
    };

    newPropertiesString = GetCurrentWorldProperties();
    if (newPropertiesString == null) {
        console.error("Error getting properties.");
        res.send(JSON.stringify(result));
        return;
    }

    newProperties = JSON.parse(newPropertiesString);
    propertiesToApply = JSON.parse(req.query.newproperties);

    // TODO: Type protection.
    if (propertiesToApply["world-name"] != null) {
        newProperties["world-name"] = propertiesToApply["world-name"];
    }

    if (propertiesToApply["day-length"] != null) {
        newProperties["day-length"] = propertiesToApply["day-length"];
    }

    if (propertiesToApply["sun-light-intensity"] != null) {
        newProperties["sun-light-intensity"] = propertiesToApply["sun-light-intensity"];
    }

    if (propertiesToApply["base-light-intensity"] != null) {
        newProperties["base-light-intensity"] = propertiesToApply["base-light-intensity"];
    }

    result.success = true;
    serializedProperties = JSON.stringify(newProperties);
    fs.writeFileSync(path.join(config["backup_directory"], "world-" + new Date().toISOString().replaceAll(":", "_") + ".json"),
        serializedProperties);
    fs.writeFileSync(config["world_config_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/updateworldtime', (req, res) => {
    result = {
        "success": false
    };

    newTimeString = GetCurrentWorldTime();
    if (newTimeString == null) {
        console.error("Error getting time.");
        res.send(JSON.stringify(result));
        return;
    }

    newTime = JSON.parse(newTimeString);
    timeToApply = JSON.parse(req.query.newtime);

    if (timeToApply["days"] != null) {
        newTime["days"] = timeToApply["days"];
    }

    if (timeToApply["secs"] != null) {
        newTime["secs"] = timeToApply["secs"];
    }

    // Apply time.

    result.success = true;

    res.send(JSON.stringify(result));
});

app.get('/restartworld', (req, res) => {
    res.send('Welcome to the Express.js Tutorial');
});

app.get('/stopworld', (req, res) => {
    res.send('Welcome to the Express.js Tutorial');
});

app.get('/startworld', (req, res) => {
    res.send('Welcome to the Express.js Tutorial');
});

app.get('/getentitylisting', (req, res) => {
    currentSettings = GetCurrentEntitySettings();
    res.send(currentSettings);
});

app.get('/addentity', (req, res) => {
    result = {
        "success": false
    };

    newEntitiesString = GetCurrentEntitySettings();
    if (newEntitiesString == null) {
        console.error("Error getting entities.");
        res.send(JSON.stringify(result));
        return;
    }

    info = JSON.parse(req.query.request);

    newEntities = JSON.parse(newEntitiesString);

    if (newEntities[info['name']] != null) {
        console.error("List already contains entity.");
        res.send(JSON.stringify(result));
        return;
    }

    newEntities[info['name']] = {
        id: info['id'],
        variants: {}
    };

    result.success = true;
    serializedProperties = JSON.stringify(newEntities);
    fs.writeFileSync(config["entity_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.post('/setentityvariant', (req, res) => {
    result = {
        "success": false
    };

    newEntitiesString = GetCurrentEntitySettings();
    if (newEntitiesString == null) {
        console.error("Error getting entities.");
        res.send(JSON.stringify(result));
        return;
    }

    info = JSON.parse(req.query.request);

    newEntities = JSON.parse(newEntitiesString);

    if (newEntities[info['entity-name']] == null) {
        console.error("Unable to find entity.");
        res.send(JSON.stringify(result));
        return;
    }
    
    variantToModify = newEntities[info['entity-name']].variants[info['variant-name']];
    if (variantToModify != null) {
        variantToModify["variant_id"] = req.body["variant_id"];
        variantToModify["model"] = req.body["model"];
        variantToModify["display_name"] = req.body["display_name"];
        variantToModify["thumbnail"] = req.body["thumbnail"];
        variantToModify["scripts"] = {};
        variantToModify["scripts"]["on_create"] = req.body.scripts["on_create"];
        variantToModify["scripts"]["on_destroy"] = req.body.scripts["on_destroy"];
        variantToModify["scripts"]["0_25_update"] = req.body.scripts["0_25_update"];
        variantToModify["scripts"]["0_5_update"] = req.body.scripts["0_5_update"];
        variantToModify["scripts"]["1_0_update"] = req.body.scripts["1_0_update"];
        variantToModify["scripts"]["2_0_update"] = req.body.scripts["2_0_update"];
        variantToModify["scripts"]["on_pickup"] = req.body.scripts["on_pickup"];
        variantToModify["scripts"]["on_place"] = req.body.scripts["on_place"];
        variantToModify["scripts"]["on_touch"] = req.body.scripts["on_touch"];
        variantToModify["scripts"]["on_untouch"] = req.body.scripts["on_untouch"];
    }
    else {
        variantToModify = {
            variant_id: req.body["variant_id"],
            model: req.body["model"],
            display_name: req.body["display_name"],
            thumbnail: req.body["thumbnail"],
            scripts: {
                on_create: req.body["on_create"],
                on_destroy: req.body["on_destroy"],
                "0_25_update": req.body["0_25_update"],
                "0_5_update": req.body["0_5_update"],
                "1_0_update": req.body["1_0_update"],
                "2_0_update": req.body["2_0_update"],
                on_pickup: req.body["on_pickup"],
                on_place: req.body["on_place"],
                on_touch: req.body["on_touch"],
                on_untouch: req.body["on_untouch"]
            }
        };
    }
    newEntities[info['entity-name']].variants[info['variant-name']] = variantToModify;

    result.success = true;
    serializedProperties = JSON.stringify(newEntities);
    fs.writeFileSync(config["entity_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/removeentity', (req, res) => {
    result = {
        "success": false
    };

    newEntitiesString = GetCurrentEntitySettings();
    if (newEntitiesString == null) {
        console.error("Error getting entities.");
        res.send(JSON.stringify(result));
        return;
    }

    info = JSON.parse(req.query.request);

    newEntities = JSON.parse(newEntitiesString);

    if (newEntities[info['entity-name']] == null) {
        console.error("Unable to find entity.");
        res.send(JSON.stringify(result));
        return;
    }

    delete newEntities[info['entity-name']];

    result.success = true;
    serializedProperties = JSON.stringify(newEntities);
    fs.writeFileSync(config["entity_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/removeentityvariant', (req, res) => {
    result = {
        "success": false
    };

    newEntitiesString = GetCurrentEntitySettings();
    if (newEntitiesString == null) {
        console.error("Error getting entities.");
        res.send(JSON.stringify(result));
        return;
    }

    info = JSON.parse(req.query.request);

    newEntities = JSON.parse(newEntitiesString);

    if (newEntities[info['entity-name']] == null) {
        console.error("Unable to find entity.");
        res.send(JSON.stringify(result));
        return;
    }

    if (newEntities[info['entity-name']].variants[info['variant-name']] == null) {
        console.error("Unable to find variant.");
        res.send(JSON.stringify(result));
        return;
    }

    variantToModify = newEntities[info['entity-name']].variants[info['variant-name']];
    if (variantToModify != null) {
        variantToModify["variant_id"] = req.body["variant_id"];
        variantToModify["model"] = req.body["model"];
        variantToModify["display_name"] = req.body["display_name"];
        variantToModify["thumbnail"] = req.body["thumbnail"];
    }
    else {
        variantToModify = {
            variant_id: req.body["variant_id"],
            model: req.body["model"],
            display_name: req.body["display_name"],
            thumbnail: req.body["thumbnail"]
        };
    }
    delete newEntities[info['entity-name']].variants[info['variant-name']];

    result.success = true;
    serializedProperties = JSON.stringify(newEntities);
    fs.writeFileSync(config["entity_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/updateentity', (req, res) => {
    result = {
        "success": false
    };

    newEntitiesString = GetCurrentEntitySettings();
    if (newEntitiesString == null) {
        console.error("Error getting entities.");
        res.send(JSON.stringify(result));
        return;
    }

    info = JSON.parse(req.query.request);

    newEntities = JSON.parse(newEntitiesString);

    if (newEntities[info['old-name']] == null) {
        console.error("Unable to find entity.");
        res.send(JSON.stringify(result));
        return;
    }
    if (info['old-name'] != info['new-name']) {
        newEntities[info['new-name']] = newEntities[info['old-name']];
        delete newEntities[info['old-name']];
    }
    newEntities[info['new-name']].id = info['new-id'];

    result.success = true;
    serializedProperties = JSON.stringify(newEntities);
    fs.writeFileSync(config["entity_settings_file"], serializedProperties);
    res.send(JSON.stringify(result));
});

app.get('/updateentityvariant', (req, res) => {
    res.send('Welcome to the Express.js Tutorial');
});

function GetCurrentWorldProperties() {
    properties = fs.readFileSync(config["world_config_file"]);
    return properties;
}

function GetCurrentBiomeSettings() {
    biomeSettings = fs.readFileSync(config["biome_settings_file"]);
    return biomeSettings;
}

function GetCurrentEntitySettings() {
    entitySettings = fs.readFileSync(config["entity_settings_file"]);
    return entitySettings;
}

function GetCurrentWorldTime() {
    time = {
        days: 0,
        secs: 0
    }
    return JSON.stringify(time);
}

function LoadConfigFile(path) {
    // Load the world configuration file
    try {
        const data = fs.readFileSync(path, 'utf8');
        config = JSON.parse(data);
        console.log("Loaded config.");
    } catch (err) {
        console.error(err);
    }
}

LoadConfigFile(argv[2]);
app.listen(15530);