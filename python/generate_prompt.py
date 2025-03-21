#!/usr/bin/env python3
import os
import argparse
import fnmatch

def load_ignore_patterns(root_dir, ignore_file_name=".llmignore"):
    """
    Load ignore patterns from the specified ignore file in the root directory.
    Lines that are empty or start with '#' are ignored.
    """
    patterns = []
    ignore_path = os.path.join(root_dir, ignore_file_name)
    if os.path.exists(ignore_path):
        with open(ignore_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    patterns.append(line)
    return patterns

def should_ignore(rel_path, ignore_patterns):
    """
    Returns True if the given relative path matches any of the ignore patterns.
    If a pattern ends with '/', it is treated as a directory pattern.
    Both the relative path and the pattern are normalized to use forward slashes.
    """
    rel_path_norm = rel_path.replace(os.sep, '/')
    for pattern in ignore_patterns:
        pattern_norm = pattern.replace(os.sep, '/')
        if pattern_norm.endswith('/'):
            pat = pattern_norm.rstrip('/')
            if rel_path_norm == pat or rel_path_norm.startswith(pat + '/'):
                return True
        else:
            if (fnmatch.fnmatch(rel_path_norm, pattern_norm) or 
                fnmatch.fnmatch(os.path.basename(rel_path_norm), pattern_norm)):
                return True
    return False

def build_tree(current_dir, root_dir, prefix="", ignore_patterns=None):
    """
    Recursively build a tree-like list of strings representing the folder structure.
    Files or directories that match the ignore_patterns are skipped.
    """
    if ignore_patterns is None:
        ignore_patterns = []
    try:
        items = sorted(os.listdir(current_dir))
    except PermissionError:
        return []
    tree_lines = []
    filtered_items = []
    for item in items:
        full_path = os.path.join(current_dir, item)
        rel_path = os.path.relpath(full_path, root_dir)
        if should_ignore(rel_path, ignore_patterns):
            continue
        filtered_items.append(item)
    for i, item in enumerate(filtered_items):
        full_path = os.path.join(current_dir, item)
        rel_path = os.path.relpath(full_path, root_dir)
        connector = "└── " if i == len(filtered_items) - 1 else "├── "
        if os.path.isdir(full_path):
            tree_lines.append(f"{prefix}{connector}{item}/")
            extension = "    " if i == len(filtered_items) - 1 else "│   "
            tree_lines.extend(build_tree(full_path, root_dir, prefix + extension, ignore_patterns))
        else:
            tree_lines.append(f"{prefix}{connector}{item}")
    return tree_lines

def generate_folder_structure(root_dir, ignore_patterns=None):
    """
    Generate the complete folder structure as a string, skipping ignored items.
    """
    if ignore_patterns is None:
        ignore_patterns = []
    base_name = os.path.basename(os.path.abspath(root_dir))
    tree_lines = [f"{base_name}/"]
    tree_lines.extend(build_tree(root_dir, root_dir, ignore_patterns=ignore_patterns))
    return "\n".join(tree_lines)

def append_file_contents(root_dir, ignore_patterns=None):
    """
    Walk through the directory tree and for each file not matching the ignore_patterns,
    append its content with a header indicating the filename and its relative path.
    """
    if ignore_patterns is None:
        ignore_patterns = []
    contents = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Filter out ignored directories
        dirnames[:] = [d for d in dirnames 
                       if not should_ignore(os.path.relpath(os.path.join(dirpath, d), root_dir), ignore_patterns)]
        filenames = sorted(f for f in filenames 
                           if not should_ignore(os.path.relpath(os.path.join(dirpath, f), root_dir), ignore_patterns))
        for filename in filenames:
            rel_dir = os.path.relpath(dirpath, root_dir)
            rel_file = os.path.join(rel_dir, filename) if rel_dir != "." else filename
            contents.append(f"\n# File: {filename}")
            contents.append(f"# Path: {rel_file}\n")
            file_path = os.path.join(dirpath, filename)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    file_text = f.read()
                contents.append(file_text)
            except Exception as e:
                contents.append(f"# Could not read file: {e}\n")
    return "\n".join(contents)

def main():
    parser = argparse.ArgumentParser(
        description="Generate an LLM prompt from a project codebase by including the folder structure and file contents."
    )
    parser.add_argument("root_dir", help="The root directory of your project")
    parser.add_argument("output_file", nargs="?", help="Optional: the file path where the prompt should be saved. If omitted, the prompt is printed to stdout.")
    parser.add_argument(
        "--ignore-file",
        default=".llmignore",
        help="The ignore file (default: .llmignore in the project root)"
    )
    args = parser.parse_args()

    ignore_patterns = load_ignore_patterns(args.root_dir, args.ignore_file)
    folder_structure = generate_folder_structure(args.root_dir, ignore_patterns)
    file_contents = append_file_contents(args.root_dir, ignore_patterns)
    prompt_text = f"Project Structure:\n\n{folder_structure}\n\n{file_contents}"

    if args.output_file:
        with open(args.output_file, "w", encoding="utf-8") as out_file:
            out_file.write(prompt_text)
        print(f"Prompt file generated at: {args.output_file}")
    else:
        print(prompt_text)

if __name__ == "__main__":
    main()
