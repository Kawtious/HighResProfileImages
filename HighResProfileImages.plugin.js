/**
 * @name High-Res Profile Images
 * @version 1.0.2
 * @author Z'ark Ashveil
 * @authorId 262113677900120065
 * @authorLink https://github.com/Kawtious
 * @description Replaces user avatars with higher resolution images
 * @source https://github.com/Kawtious/HighResProfileImages
 * @updateUrl https://raw.githubusercontent.com/Kawtious/HighResProfileImages/main/HighResProfileImages.plugin.js
 */

const PLUGIN_ID = "HighResProfileImages";

const VALID_SIZES = [
    256,
    512,
    1024,
    2048,
    4096
]

const DEFAULT_SETTINGS = {
    resSize: VALID_SIZES[0]
}

module.exports = class HighResProfileImages {
    constructor() {
        this.settings = BdApi.Data.load(PLUGIN_ID, "settings");

        if (!this.settings) {
            this.settings = DEFAULT_SETTINGS;
            BdApi.Data.save(PLUGIN_ID, "settings", this.settings);
        }
    }

    start() {
        // Patch everything that fetches the user's avatar
        BdApi.Patcher.after(
            PLUGIN_ID,
            BdApi.Webpack.getModule(m => m?.getUserAvatarURL),
            "getUserAvatarURL",
            (_, __, returnValue) => this.patchUserAvatar(returnValue)
        );
    }

    stop() {
        BdApi.Patcher.unpatchAll(PLUGIN_ID);
    }

    getSettingsPanel() {
        const resSize = {
            id: "resSize",
            name: "Avatar Size",
            note: "Warning: The higher the value, the more resources will be used",
            type: "dropdown",
            value: this.settings.resSize,
            options: VALID_SIZES.map(size => { return { label: size, value: size } })
        };

        return BdApi.UI.buildSettingsPanel({
            settings: [resSize],
            onChange: (_, id, value) => {
                this.settings[id] = value;
                BdApi.Data.save(PLUGIN_ID, "settings", this.settings);
            }
        });
    }

    patchUserAvatar(url) {
        if (!url || typeof url !== "string") return url;

        if (!VALID_SIZES.includes(this.settings.resSize)) return url;

        // Add 'size' parameter if URL doesn't have it
        if (!/[?&]size=/.test(url))
            return url + (url.includes("?") ? "&" : "?") + `size=${this.settings.resSize}`;

        return url.replace(/([?&])size=\d+/g, `$1size=${this.settings.resSize}`);
    }
};
