import numpy as np
import psycopg2

try:
	conn = psycopg2.connect("dbname='steffenp' user='steffenp' host='localhost' port='5431' password=''")
except:
	print "I am unable to connect to the database"

cur = conn.cursor()


polygonquery = "SELECT id,ST_AsText(tgeo) FROM terraintrondheim;"

cur.execute(polygonquery)
rows = cur.fetchall()

for row in rows:
	id = row[0]
	polygonstring = row[1][12:len(row[1])-2]
	polygon = polygonstring.split(',');
	points = []
	for point in polygon:
		coord = point.split(' ')
		points.append(coord)
	x = np.array(points[0]).astype(int)
	y = np.array(points[1]).astype(int)
	perpendicular = np.cross(x,y)
	normvec = perpendicular/np.linalg.norm(perpendicular)
	if(normvec[2] < 0): normvec[2] = normvec[2]*(-1);
	vecquery = "UPDATE terraintrondheim SET tpgeo='{0} {1} {2}' WHERE id={3};".format(normvec[0],normvec[1],normvec[2],id)
	cur.execute(vecquery)
	print id

conn.commit()
cur.close()
conn.close()