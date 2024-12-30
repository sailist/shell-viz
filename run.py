import subprocess
import networkx as nx
from pathlib import Path
import matplotlib.pyplot as plt
import fire

funcname2file = {}

error_files = []
funcname2cmd = []


def main(repo_path: str):
    G = nx.DiGraph()
    for script_file in Path(repo_path).glob("**/*.sh"):
        try:
            output = subprocess.check_output(
                ["node", "parse.js", str(script_file)]
            ).decode("utf-8")
        except Exception as e:
            error_files.append(script_file)
            continue

        for line in output.splitlines():
            func, cmd = line.split(" -> ")
            cmd = cmd.split()[0]
            G.add_edge(func, cmd)
            funcname2file[func] = script_file
            funcname2cmd.append((func, cmd))
            

    for func, cmd in set(funcname2cmd):
        if cmd not in funcname2file:
            print(func)
            continue
        print(f"'{func}' -> '{cmd}'")

    nx.draw(G, with_labels=True)
    plt.savefig("graph.png")


if __name__ == "__main__":
    fire.Fire(main)
