from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route('/api/skillrack', methods=['POST'])
def scrape_skillrack():
    content = request.get_json()
    url = content.get("url")

    if not url or "skillrack.com/faces/resume" not in url:
        return jsonify({"error": "Invalid SkillRack profile link!"}), 400

    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch SkillRack page"}), 400

    soup = BeautifulSoup(response.text, "lxml")
    lines = soup.get_text(separator="\n", strip=True).split('\n')

    data = {}
    labels = [
        "RANK", "LEVEL", "GOLD", "SILVER", "BRONZE", "PROGRAMS SOLVED",
        "CODE TEST", "CODE TRACK", "DC", "DT", "CODE TUTOR",
        "C", "Python3", "Java", "CPP23", "SQL", "CPP"
    ]

    for i in range(len(lines)):
        if lines[i] == "PROGRAMMING SUMMARY" and i >= 5:
            data["NAME"] = lines[i - 5]
            data["ID"] = lines[i - 4]
            data["DEPARTMENT"] = lines[i - 3]
            data["COLLEGE"] = lines[i - 2]
            data["YEAR"] = lines[i - 1].replace("(", "").replace(")", "")
            break

    for i in range(1, len(lines)):
        if lines[i] in labels:
            data[lines[i]] = lines[i - 1]

    result = {
        "name": data.get("NAME", ""),
        "id": data.get("ID", ""),
        "department": data.get("DEPARTMENT", ""),
        "college": data.get("COLLEGE", ""),
        "year": data.get("YEAR", ""),
        "globalRank": data.get("RANK", "0"),
        "level": data.get("LEVEL", "0"),
        "gold": data.get("GOLD", "0"),
        "silver": data.get("SILVER", "0"),
        "bronze": data.get("BRONZE", "0"),
        "solved": data.get("PROGRAMS SOLVED", "0"),
        "codeTrack": int(data.get("CODE TRACK", "0")),
        "dc": int(data.get("DC", "0")),
        "dt": int(data.get("DT", "0")),
        "codeTutor": int(data.get("CODE TUTOR", "0"))
    }

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
