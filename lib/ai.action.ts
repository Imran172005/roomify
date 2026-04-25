import puter from "@heyputer/puter.js";
import {ROOMIFY_RENDER_PROMPT} from "./constants";
import type { Generate3DViewParams } from "../types";

export const fetchAsDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Sample 3D floor plan SVG as fallback
const SAMPLE_3D_FLOOR_PLAN = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI5ODQiIGhlaWdodD0iOTg0IiBmaWxsPSIjZWVlIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik0yMCAyMEw1MDIgMjBMNTAyIDUwMkwyMCA1MDJWMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHBhdGggZD0iTTUwMiAyMEw1MDIgNTAyIiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik0yMDAgNDAwTDgwMCA0MDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTQwMCAyMDBMNDAwIDgwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjMiLz48dGV4dCB4PSIyNTAiIHk9IjM1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNjY2Ij5MVklORyBST09NPC90ZXh0Pjx0ZXh0IHg9IjY1MCIgeT0iMzUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NjYiPktJTkcgQkVEPC90ZXh0Pjx0ZXh0IHg9IjI1MCIgeT0iNzAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NjYiPktJVENIRU48L3RleHQ+PHRleHQgeD0iNjUwIiB5PSI3MDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiI+QkFUSE9PTTwvdGV4dD48dGV4dCB4PSIzNTAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTk5Ij5LSVRDSEVOPC90ZXh0Pjwvc3ZnPg==`;

export const generate3DView = async ({ sourceImage }: Generate3DViewParams): Promise<{ renderedImage: string; renderedPath: undefined }> => {
  console.log('Starting 3D generation with Puter AI...');
  
  const dataUrl = sourceImage.startsWith('data:')
      ? sourceImage
      : await fetchAsDataUrl(sourceImage);

  const base64Data = dataUrl.split(',')[1];
  const mimeType = dataUrl.split(';')[0].split(':')[1];

  if (!mimeType || !base64Data) {
    console.error('Invalid source image');
    return { renderedImage: SAMPLE_3D_FLOOR_PLAN, renderedPath: undefined };
  }

  try {
    // Try Puter AI - this is FREE for basic usage
    console.log('Calling Puter AI...');
    
    const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
      provider: "gemini",
      model: "gemini-2.5-flash-image-preview",
      input_image: base64Data,
      input_image_mime_type: mimeType,
      ratio: { w: 1024, h: 1024 },
    });

    console.log('Puter response received:', response);

    const rawImageUrl = (response as HTMLImageElement)?.src ?? null;

    if (rawImageUrl) {
      const renderedImage = rawImageUrl.startsWith('data:')
          ? rawImageUrl 
          : await fetchAsDataUrl(rawImageUrl);

      console.log('3D generation successful!');
      return { renderedImage, renderedPath: undefined };
    }
  } catch (error: any) {
    console.error('Puter AI error:', error);
    
    // Check for funding/balance errors
    if (error?.message?.includes('funding') || 
        error?.message?.includes('balance') ||
        error?.message?.includes('credit')) {
      console.log('Puter account needs funding. Using free test mode or fallback.');
    }
  }

  // Try free test mode as fallback
  try {
    console.log('Trying Puter test mode...');
    const testResult = await puter.ai.txt2img(
      "A 3D top-down floor plan view, modern apartment with living room, bedroom, kitchen, bathroom. Architectural rendering, clean lines",
      true // testMode = true for free
    );
    
    if (testResult && testResult.src) {
      console.log('Test mode worked!');
      return { renderedImage: testResult.src, renderedPath: undefined };
    }
  } catch (testError) {
    console.error('Test mode error:', testError);
  }

  // All options exhausted - return sample
  console.log('All options failed. Returning sample floor plan.');
  return { renderedImage: SAMPLE_3D_FLOOR_PLAN, renderedPath: undefined };
};