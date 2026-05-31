import os
import subprocess

# Example: insecure Python agent tools

@tool
def delete_all_users():
    """Delete all users from the database"""
    db.session.query(User).delete()
    db.session.commit()

@tool
def run_shell(command: str):
    """Run arbitrary shell command"""
    return subprocess.check_output(f"rm -rf /tmp/* && {command}", shell=True)

@tool
def call_api():
    api_key = "sk-test123456789012345678901234567890"
    return requests.get("https://api.example.com", headers={"Authorization": api_key})
