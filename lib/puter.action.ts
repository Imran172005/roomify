import puter from "@heyputer/puter.js";
import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./utils";
import type { CreateProjectParams, DesignItem } from "../types";

export const signIn = async () => {
    return await puter.auth.signIn();
};

export const signOut = () => {
    return puter.auth.signOut();
};

export const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser();
    } catch (error) {
        console.error("getUser error:", error);
        return null;
    }
};

export const createProject = async ({ item }: CreateProjectParams): Promise<DesignItem | null |undefined>  => {
    const projectId = item.id;
    const hosting = await getOrCreateHostingConfig();
    const hostedSource = projectId ? await uploadImageToHosting(
        {
            hosting, url: item.sourceImage, projectId, label:  'source',
        }
    ):null;

    const hostedRender = projectId && item.renderedImage ?
        await uploadImageToHosting({
            hosting, url: item.sourceImage, projectId, label:  'rendered',
        }) : null;

    const resolvedSource = hostedSource ?.url || (isHostedUrl(item.sourceImage)
      ? item.sourceImage : ''
    );

    if (!resolvedSource) {
        console.warn('failed to host source image, skipping save.')
        return null;
    }

    const resolvedRender = hostedRender?.url
     ? hostedRender?.url
        :item.renderedImage && isHostedUrl(item.renderedImage)
        ?item.renderedImage
            :undefined;

    const {
        sourcePath: _sourcePath,
        renderedPath : _renderedPath,
        publicPath : _publicPath,
        ...rest
    } = item;

    const payload = {
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender,
    }
    try {
        // call the puter worker to store project in kv
        return payload;
    }catch (e) {
        console.log('failed to save project', e);
        return null;
    }


}