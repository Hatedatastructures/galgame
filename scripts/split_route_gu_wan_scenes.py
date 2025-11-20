import json
import os


def load_route_json(route_path: str) -> dict:
    with open(route_path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_scene_file(output_dir: str, scene: dict) -> str:
    scene_id = scene.get("scene_id")
    if not scene_id:
        return ""
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, f"{scene_id}.json")
    with open(out_path, "w", encoding="utf-8") as out:
        json.dump(scene, out, ensure_ascii=False, indent=4)
        out.write("\n")
    return out_path


def main():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    route_path = os.path.join(project_root, "data", "route_gu_wan.json")
    output_dir = os.path.join(project_root, "data", "route_gu_wan_scenes")

    route_data = load_route_json(route_path)
    scenes = route_data.get("scenes", [])

    written_paths = []
    for scene in scenes:
        p = write_scene_file(output_dir, scene)
        if p:
            written_paths.append(p)

    print(f"written {len(written_paths)} scene files to {output_dir}")


if __name__ == "__main__":
    main()