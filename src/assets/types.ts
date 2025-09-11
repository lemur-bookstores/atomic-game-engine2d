import { Texture, SpriteSheet } from "@/graphics";
import { ASSET_EVENTS } from "@/types";

export type AssetType = 'texture' | 'audio' | 'json' | 'text' | 'spritesheet';

// Adjusted AssetLoadEvent type to match ASSET_EVENTS
export interface AssetLoadEvent {
    type: typeof ASSET_EVENTS[keyof typeof ASSET_EVENTS];
    asset: string;
    assetType: AssetType;
    progress?: number;
    error?: Error;
}

interface AssetBase {
    type: AssetType;
}

export interface TextureAsset extends AssetBase {
    type: 'texture'
    data: Texture
}

export interface SpriteSheetAsset extends AssetBase {
    type: 'spritesheet'
    data: Texture
    spriteSheet: SpriteSheet
}

export interface AudioAsset extends AssetBase {
    type: 'audio'
    data: AudioBuffer
}

export interface TextAsset extends AssetBase {
    type: 'text'
    data: string
}

export interface JsonAsset extends AssetBase {
    type: 'json'
    data: any
}

export type Asset = TextureAsset
    | SpriteSheetAsset
    | AudioAsset
    | TextAsset
    | JsonAsset;