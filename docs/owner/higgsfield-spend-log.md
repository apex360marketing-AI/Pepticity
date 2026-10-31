# Higgsfield spend log (credit-guard)

Older spends are listed in media/manifest.tsv.

date | piece / ledger id | model + settings | credits | balance after | job id | PASS/FAIL | why
---|---|---|---|---|---|---|---
2026-10-30 | doors2 white end still (R170 second doors) | gpt_image_2_5 high 2k 16:9 | 2.75 | - | 18bf15ea-3d7e-4fb4-93dc-82f42e81c239 | PASS | no text, matches lab; film stopped by owner change of plan
2026-10-30 | doors2 black end still (R170) | gpt_image_2_5 high 2k 16:9 | 2.75 | - | 5a3d089a-26f1-42b3-87d4-4f3dd978328f | PASS | no text; still has hanging strand (owner now wants it on the logo wall)
2026-10-30 | lab3 white lab sample | gpt_image_2_5 high 2k 16:9 | 2.75 | - | dc1047fb-5743-4a32-93f2-78d9cac80c35 | PASS | name exact, blue chain only colour (2%), R-B 25 vs 60
2026-10-30 | lab3 black lab sample | gpt_image_2_5 high 2k 16:9 | 2.75 | - | f40c550a-c512-49fe-abd1-e25dd6bdde90 | PASS | name exact, cool-white glow, blue only colour
2026-10-30 | lab3 white doors take 1 | gpt_image_2_5 high 2k 16:9 | 2.75 | - | 137a1ea5-f9da-4e7e-92ca-dfec5cb0433e | FAIL | warm gold cast on 27% of pixels
2026-10-30 | lab3 white doors retry | gpt_image_2_5 high 2k 16:9 | 2.75 | - | 3cd3d0be-50a7-4884-9a01-4958a12416b1 | PASS | 0% warm, blue only colour, letters exact
2026-10-30 | lab3 black doors sample | gpt_image_2_5 high 2k 16:9 | 2.75 | 444.41 | 062d1642-4b26-4afa-af9e-f6808c7f0e17 | PASS | violet gone, blue only colour
2026-10-30 | lab3 white lab START still (R172, owner OK 1A) | gpt_image_2_5 high 2k 16:9 | 2.75 | - | 7993fc58-ffe0-4ddd-850c-449ab021ab10 | PASS | strand gone, blue chain only colour (2.6%), 0% warm, PEPTICITY exact
2026-10-30 | lab3 black lab START still (R172) | gpt_image_2_5 high 2k 16:9 | 2.75 | - | 8dc81c72-6065-4c5f-a7fd-0b36224ae506 | PASS | strand gone, blue only colour (2.1%), 0% warm, 0% violet
2026-10-30 | lab3 white lab FILM test (R172) | kling3_0 pro 10s sound off, start 7993fc58 end dc1047fb | 17.5 | - | 610fec58-e721-459a-86df-950b069c1830 | PASS | smooth dolly-in, PEPTICITY sharp every frame, blue chain only colour; warm stone neutralised at cut (tools/cut-lab.py)
2026-10-30 | doors2 black hall end still v2 (R172 fix) | gpt_image_2_5 high 2k 16:9, edit of 5a3d089a | 2.75 | - | a3147bc3-d822-41eb-acc9-151a3a117de5 | PASS | strands + reflections gone, violet door now blue (only colour), 0% violet
2026-10-30 | doors2 white hall end still v2 (R172 fix) | gpt_image_2_5 high 2k 16:9, edit of 18bf15ea | 2.75 | - | 2d46fec5-4853-4258-89db-880c4b9c7458 | PASS | strands gone, thin blue door line only colour, 0% warm
2026-10-31 | lab3 black lab FILM (R172, owner 1A/2A) | kling3_0 pro 10s sound off, start 8dc81c72 end f40c550a | 17.5 | - | a27b604b-bfcf-4b8d-8af9-ae8759b6ac11 | PASS | smooth dolly-in, PEPTICITY sharp, blue chain only colour
2026-10-31 | doors2 white second-doors FILM test (R170/R172) | kling3_0 pro 10s sound off, start dc1047fb end 2d46fec5 | 17.5 | - | 861c6574-d0e6-4a23-9df2-8eeefcfd31f3 | PASS | smooth glide from new lab wall into the hall, no strands, blue only colour
2026-10-31 | doors2 black second-doors FILM (R170/R172) | kling3_0 pro 10s sound off, start f40c550a end a3147bc3 | 17.5 | - | 0c815b5a-a176-4143-80ce-be7bb03aae7e | PASS | smooth glide from black lab wall into the black hall, no strands, blue door only colour
