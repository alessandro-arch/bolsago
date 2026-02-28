import { APP_VERSION, BUILD_TIME, ENVIRONMENT } from "@/lib/version";

export default function Health() {
  const data = {
    version: APP_VERSION,
    environment: ENVIRONMENT,
    buildTime: BUILD_TIME,
  };

  return (
    <pre className="p-8 font-mono text-sm">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
