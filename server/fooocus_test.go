package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDecodeMetadata(t *testing.T) {
	pngData := map[string]string{
		"fooocus_scheme": fooocus,
		"parameters": `{
			"adm_guidance": "(1.5, 0.8, 0.3)",
			"base_model": "juggernautXL_v8Rundiffusion",
			"base_model_hash": "aeb7e9e689",
			"clip_skip": 2,
			"full_negative_prompt": ["(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate, (airbrushed, cartoon, anime, semi-realistic, cgi, render, blender, digital art, manga, amateur:1.3), (3D ,3D Game, 3D Game Scene, 3D Character:1.1), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3)", "anime, cartoon, graphic, (blur, blurry, bokeh), text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured"],
			"full_prompt": ["cinematic still A sunflower field . emotional, harmonious, vignette, 4k epic detailed, shot on kodak, 35mm photo, sharp focus, high budget, cinemascope, moody, epic, gorgeous, film grain, grainy", "A sunflower field, highly detailed, magic, peaceful, flowing, beautiful, atmosphere, radiant, magical, sharp focus, very coherent, intricate, elegant, epic, colorful, amazing composition, cinematic, artistic, fine detail, professional, clear, joyful, unique, expressive, cute, iconic, best, vivid, awesome, perfect, ambient background, pristine, creative"],
			"guidance_scale": 4,
			"lora_combined_1": "sd_xl_offset_example-lora_1.0 : 0.1",
			"loras": [["sd_xl_offset_example-lora_1.0", 0.1, "4852686128"]],
			"metadata_scheme": "fooocus",
			"negative_prompt": "",
			"performance": "Speed",
			"prompt": "A sunflower field",
			"prompt_expansion": "A sunflower field, highly detailed, magic, peaceful, flowing, beautiful, atmosphere, radiant, magical, sharp focus, very coherent, intricate, elegant, epic, colorful, amazing composition, cinematic, artistic, fine detail, professional, clear, joyful, unique, expressive, cute, iconic, best, vivid, awesome, perfect, ambient background, pristine, creative",
			"refiner_model": "None",
			"refiner_switch": 0.5,
			"resolution": "(512, 512)",
			"sampler": "dpmpp_2m_sde_gpu",
			"scheduler": "karras",
			"seed": "127589946317439009",
			"sharpness": 2,
			"steps": 30,
			"styles": "['Fooocus V2', 'Fooocus Enhance', 'Fooocus Sharp']",
			"vae": "Default (model)",
			"version": "Fooocus v2.5.5"
		}`,
	}
	fooocusData, err := ExtractFoocusMetadata(nil, pngData)
	require.NoError(t, err)

	assert.Equal(t, "Fooocus v2.5.5", fooocusData.Version)
}
