// Keep clean-runner resource staging and the private default portable to cmd.exe.
import { spawnSync } from "node:child_process";

const result = spawnSync(
	"node scripts/prepare-tessdata.mjs && pnpm pdfium:stage && pnpm adapters:stage && pnpm plugin-worker:stage:release && pnpm build",
	{
		shell: true,
		stdio: "inherit",
		env: {
			...process.env,
			VITE_AGENTERO_RELAY_ENDPOINT:
				process.env.VITE_AGENTERO_RELAY_ENDPOINT?.trim() ||
				"ws://10.112.112.91:4000",
		},
	},
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
