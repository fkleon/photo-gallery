package main

import (
	"encoding/json"
	"fmt"

	"github.com/mholt/goexif2/exif"
)

// Fooocus (json) metadata scheme as per https://github.com/lllyasviel/Fooocus/pull/1940
type FooocusMeta struct {
	AdmGuidance        string   `json:"adm_guidance"`
	BaseModel          string   `json:"base_model"`
	BaseModelHash      string   `json:"base_model_hash"`
	ClipSkip           uint8    `json:"clip_skip"`
	CreatedBy          string   `json:"created_by,omitempty"`
	FullNegativePrompt []string `json:"full_negative_prompt"`
	FullPrompt         []string `json:"full_prompt"`
	GuidanceScale      float32  `json:"guidance_scale"`
	Loras              [][]any  `json:"loras"` // list [string, float32, string] (lora name, lora weight, lora hash)
	LoraCombined1      string   `json:"lora_combined_1,omitempty"`
	LoraCombined2      string   `json:"lora_combined_2,omitempty"`
	LoraCombined3      string   `json:"lora_combined_3,omitempty"`
	LoraCombined4      string   `json:"lora_combined_4,omitempty"`
	LoraCombined5      string   `json:"lora_combined_5,omitempty"`
	MetadataScheme     string   `json:"metadata_scheme"`
	NegativePrompt     string   `json:"negative_prompt"`
	Performance        string   `json:"performance"`
	Prompt             string   `json:"prompt"`
	PromptExpansion    string   `json:"prompt_expansion"`
	RefinerModel       string   `json:"refiner_model,omitempty"`
	RefinerModelHash   string   `json:"refiner_model_hash,omitempty"`
	RefinerSwitch      float32  `json:"refiner_switch"`
	Resolution         string   `json:"resolution"`
	Sampler            string   `json:"sampler"`
	Scheduler          string   `json:"scheduler"`
	Seed               string   `json:"seed"`
	Sharpness          float32  `json:"sharpness"`
	Steps              uint8    `json:"steps"`
	Styles             string   `json:"styles"`
	Vae                string   `json:"vae"`
	Version            string   `json:"version"`
}

// Fooocus suports encoding metadata with one of two schemes:
// - the native JSON scheme
// - the AUTOMATIC1111 plaintext format for compatibility with Stable Diffusion web UI
const (
	fooocus = "fooocus"
	a1111   = "a1111"
)

func ExtractFoocusMetadata(exifData *exif.Exif, pngData map[string]string) (*FooocusMeta, error) {

	var metadata_scheme, parameters string

	// Try sourcing metadata:
	// 1. from PNG tEXt chunks
	// 2. from EXIF data
	if scheme, ok := pngData["fooocus_scheme"]; ok {
		fmt.Println("Extracting Fooocus metadata from PNG tEXt..")
		metadata_scheme = scheme
		parameters = pngData["parameters"]
	} else if exifData != nil {
		fmt.Println("Extracting Fooocus metadata from EXIF..")
		makerNote, exifErr := exifData.Get(exif.MakerNote)
		if exifErr != nil {
			return nil, exifErr
		}
		metadata_scheme, _ = makerNote.StringVal()

		userComment, exifErr := exifData.Get(exif.UserComment)
		if exifErr != nil {
			return nil, exifErr
		}
		parameters, _ = userComment.StringVal()
	}

	// Scheme is one of 'fooocus' or 'a1111'
	if metadata_scheme != fooocus {
		return nil, fmt.Errorf("unsupported Fooocus metadata scheme: %s", metadata_scheme)
	}

	// Parse metadata
	metadata := &FooocusMeta{}
	err := json.Unmarshal([]byte(parameters), metadata)
	if err != nil {
		return nil, fmt.Errorf("failed to read Fooocus parameters: %w", err)
	}

	return metadata, nil
}
