#!/bin/bash
find . -type f -iname '*.wacz' | while read wacz ; do 
	unzip -p $wacz pages/pages.jsonl pages/extraPages.jsonl | 
		jq -c --arg wacz $(basename $wacz) 'select(.url)|{$wacz,url}' ; 
done > TMP
if [ -f index.jsonl ] ; then
	mv index.jsonl index.jsonl.old
	cat index.jsonl.old TMP | sort -u > index.jsonl
	printf "added %d URLs from %d files\n" "$(cat TMP | wc -l)" "$(find . -type f -iname '*.wacz' | wc -l)"
	rm TMP
else
	mv TMP index.jsonl
fi
urls="$(cat index.jsonl | wc -l)"
files="$(jq -c '.wacz' index.jsonl | sort -u | wc -l)"
updated="$(date -Is)"
echo '{}' | jq -c --arg urls $urls --arg files $files --arg updated $updated '{$updated,$urls,$files}' > stats.jsonl
jq . stats.jsonl

echo 'generated index.jsonl and stats.jsonl. please put these files in the data directory for the webpage'
