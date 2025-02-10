# Copyright (c) 2023 - 2024, Owners of https://github.com/ag2ai
#
# SPDX-License-Identifier: Apache-2.0
#
# Portions derived from  https://github.com/microsoft/autogen are under the MIT License.
# SPDX-License-Identifier: MIT
import os
from typing import Optional

import typer
import uvicorn
from typing_extensions import Annotated


app = typer.Typer()


@app.command()
def ui(
    host: str = "127.0.0.1",
    port: int = 8081,
    workers: int = 1,
    reload: Annotated[bool, typer.Option("--reload")] = True,
    docs: bool = False,
    appdir: str = None,
    database_uri: Optional[str] = None,
):
    """
    Run the AG2 Studio UI.

    Args:
        host (str, optional): Host to run the UI on. Defaults to 127.0.0.1 (localhost).
        port (int, optional): Port to run the UI on. Defaults to 8081.
        workers (int, optional): Number of workers to run the UI with. Defaults to 1.
        reload (bool, optional): Whether to reload the UI on code changes. Defaults to False.
        docs (bool, optional): Whether to generate API docs. Defaults to False.
        appdir (str, optional): Path to the AG2 Studio app directory. Defaults to None.
        database-uri (str, optional): Database URI to connect to. Defaults to None. Examples include sqlite:///ag2studio.db, postgresql://user:password@localhost/ag2studio.
    """

    os.environ["AGENTBUILDER_API_DOCS"] = str(docs)
    if appdir:
        os.environ["AGENTBUILDER_APPDIR"] = appdir
    if database_uri:
        os.environ["AGENT_BUILDER_DB_URI"] = database_uri

    uvicorn.run(
        "agent_builder.web.app:app",
        host=host,
        port=port,
        workers=workers,
        reload=reload,
    )


@app.command()
def version():
    """
    Print the version of the AG2 Studio UI CLI.
    """

    typer.echo(f"CLI version: 0.1.0")


def run():
    app()


if __name__ == "__main__":
    app()
