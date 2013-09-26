#
# Script to import ascii files to postgis
#

import psycopg2

try:
	conn = psycopg2.connect("dbname='steffenp' user='steffenp' host='localhost' port='5431' password=''")
except:
	print "I am unable to connect to the database"

cur = conn.cursor()

f = open('triangles.txt','r')

i = 1

for line in f:
	if(i == 1):
		str = "POLYGON Z (("
		i = i+1
		continue
	elif(i == 2 or i == 3 or i== 4 or i== 5):
		columns = line.split()
		str = str+columns[0]+" "+columns[1]+" "+columns[2]+","
		i = i + 1
		continue 
	elif(i == 6):
		str = str[:-1] + "))"
		linestringex =  "INSERT INTO terraintrondheim(tgeo) VALUES(ST_GeomFromText('"+str+"',32633));"
		cur.execute(linestringex)
		i = 1
		continue
	# line = line.strip()
	# columns = line.split()
	# source = {}
	# source['E'] = columns[0]
	# source['N'] = columns[1]
	# source['h'] = columns[2]
	# linestringex =  "INSERT INTO terraintrondheim VALUES(%s,ST_GeomFromText('POINT(%s %s %s)',32633));" %(i,source['N'],source['E'],source['h'])
	# #print linestringex
	# #break
	# cur.execute(linestringex)
	# print i
	# i = i+1

conn.commit()
cur.close()
conn.close()