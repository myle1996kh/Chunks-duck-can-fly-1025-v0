import sqlite3

conn = sqlite3.connect('fluency_game.db')
cursor = conn.cursor()

# Count total sessions
cursor.execute('SELECT COUNT(*) FROM sessions')
total = cursor.fetchone()[0]
print(f'Total sessions: {total}')

# Show latest 5 sessions
cursor.execute('SELECT id, student_id, sentence_id, score, total_duration, audio_file_path FROM sessions ORDER BY id DESC LIMIT 5')
print('\nLatest 5 sessions:')
for row in cursor.fetchall():
    print(f'  ID:{row[0]} Student:{row[1]} Sentence:{row[2]} Score:{row[3]} Duration:{row[4]}s File:{row[5]}')

conn.close()
