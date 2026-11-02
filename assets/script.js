let ts0 = Date.now();
let dataTable;
let loadingComplete = false;

$(document).ready(function(){
  // Initialize DataTable with empty data first
  dataTable = $('#wacz').DataTable({
    data: [], // Start empty, we'll load data via streaming
    initComplete: () => {
      let ts1 = Date.now();
      console.log(`Initial table setup completed in ${(ts1-ts0)/1000}s`);
      
      // After initialization, start the streaming load process
      const streamer = new DataStreamer({
        firstChunkMinSize: 100,       // Show first results quickly
        progressiveChunkSize: 50000   // Standard size for streaming chunks
      });
      
      streamer.streamJSONL(
        'data/index.jsonl', 
        {
          onFirstChunkLoaded: ({rows, count, time}) => {
            console.log(`First chunk of ${count} rows loaded in ${time}s`);
            dataTable.rows.add(rows).draw();
          },
          onProgressiveChunkLoaded: ({rows, count, totalCount, time}) => {
            console.log(`Progressive chunk of ${count} rows loaded (total: ${totalCount}, ${time}s)`);
            dataTable.rows.add(rows).draw(false);
          },
          onAllDataLoaded: ({count, time}) => {
            console.log(`Full data loaded in ${time}s, total ${count} records`);
            dataTable.draw(false);
            loadingComplete = true;
            hideLoadingIndicator();
	    fetch('data/stats.jsonl').then(r=>r.json()).then(j=>{
		if(j&&j?.urls&&j?.files&&j?.updated) {
            		document.getElementById('entries').textContent=`${+j.urls} URL${j.urls===1?'':'s'} across ${+j.files} wacz file${j.files===1?'':'s'}`
			document.getElementById('updated').textContent=`last updated ${j.updated.split('T')[0]}`
		}
	    });
          },
          onError: (error) => {
            console.error('Error loading JSONL file:', error);
            showErrorMessage(error);
            hideLoadingIndicator();
          },
          onLoadingStarted: () => {
            showLoadingIndicator();
          }
        }
      );
    },
    order: {
      name:'wacz',
      dir:'asc'
    },
    columns: [
      {data:'wacz', name:'file', title:'file'},
      {data:'url', name:'url', title:'url'},
    ],
    processing: true,
    deferRender: true, // Add this for better performance with large datasets
    language: {
      processing: "Loading data..."
    }
  });
});

/**
 * Shows the loading indicator in the UI
 */
function showLoadingIndicator() {
  document.getElementById('loading-indicator').hidden = false;
}

/**
 * Hides the loading indicator from the UI
 */
function hideLoadingIndicator() {
  document.getElementById('loading-indicator').hidden = true;
}

/**
 * Displays an error message to the user
 * @param {Error} error - The error that occurred
 */
function showErrorMessage(error) {
  $('body').append(`<div class="error-message" style="color:red">Error loading data: ${error.message}</div>`);
}
