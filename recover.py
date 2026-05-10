import json

log_file = "/Users/ptmultiarealplaningindonesia/.gemini/antigravity/brain/8d82e1f5-6e50-4ea0-adce-caa23980be17/.system_generated/logs/overview.txt"
target_file = "/Users/ptmultiarealplaningindonesia/Desktop/my webapp/f1-quiz/app/page.tsx"

with open(log_file, "r") as f:
    lines = f.readlines()

best_content = ""
for line in lines:
    try:
        data = json.loads(line)
        if "tool_calls" in data:
            for tc in data["tool_calls"]:
                if tc["name"] == "write_to_file":
                    args = tc.get("args", {})
                    if args.get("TargetFile") == target_file:
                        content = args.get("CodeContent", "")
                        # We want the one BEFORE the brutalist revamp (which had 'Jalur DtS')
                        if "Jalur DtS" not in content and len(content) > 1000:
                            best_content = content
    except:
        pass

if best_content:
    with open("recovered_page.tsx", "w") as f:
        f.write(best_content)
    print("Recovered file with length:", len(best_content))
else:
    print("Could not find suitable backup.")
