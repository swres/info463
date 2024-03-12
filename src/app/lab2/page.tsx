"use client";
import styles from "../page.module.css";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import Slider from '@mui/material/Slider';
import { mkConfig, generateCsv, download } from "export-to-csv";
import { VictoryScatter, VictoryLine, VictoryChart, VictoryLabel, VictoryAxis } from 'victory';

export default function Lab2() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h2>Lab 2: Fitts' Law</h2>
        <p>In this week's lab, you will be testing out Fitts' law for yourself. Your task is to do the following:</p>
        <ol>
          <li>Set up and conduct your own Fitts' law experiment. Take note of the pattern of results you get.</li>
          <li>Modify the experiment in some way (e.g. make the range of sizes wider, change the alpha, use a different pointing device (e.g. a mouse vs. trackpad), etc).</li>
        </ol>
        <br></br>
        <p>Once you've done that, answer the following questions:</p>
        <ol>
          <li>How robust is Fitt's law? That is, does it accurately predict the data you collected today?</li>
          <li>What other variables did you change, and how (if at all) did it affect the results of the experiment?</li>
        </ol>
        <br></br>
        <p>To conduct the experiment, set up the parameters below, then click "begin experiment." You will alternate between clicking a 
          square in the top-left corner, and a target. Try to click the targets as fast as you can. There is no penalty for inaccuracy.
          When you're done, you'll have the option to download a CSV of your data. 
        </p>
      </div>
      {ExpOptions()}
      {Experiment()}
    </main>
  );
}

let alpha = 1;
let r = 200;
let b = 200;
let g = 200;

let screenWidth = window.screen.width / 2;
let screenHeight = 400;
let maxSize = 80;
let minSize = 10;
let maxDist = 240;
let minDist = 30

let numTrials = 25;
let curTrial = 0;

let dataRows : any[] = [];

function ExpOptions(){
  const [sizes, setSizes] = useState([10,80])
  const handleSize = (event: Event, newValue: number | number[]) => {
    setSizes(newValue as number[]);
    minSize = sizes[0];
    maxSize = sizes[1];
  };

  const [dists, setDists] = useState([30,240])
  const handleDist = (event: Event, newValue: number | number[]) => {
    let vals = newValue as number[];
    setDists(vals);
    minDist = vals[0];
    maxDist = vals[1];
  };

  const [numberTrials, setNumTrials] = useState(25)
  const handleNumTrials = (event: Event, newValue: number | number[]) => {
    setNumTrials(newValue as number);
    numTrials = (newValue as number);
  }

  return (
    <div>
      <h3>Size range for targets</h3>
      <Box sx={{ width: 300 }}>
      <Slider
        getAriaLabel={() => 'Size range'}
        value={sizes}
        onChange={handleSize}
        valueLabelDisplay="auto"
      />
      </Box>
      <div style = {{position: 'relative', height: '100px'}}>
        <div style = {{width: `${sizes[0]}px`, height: `${sizes[0]}px`, background: 'black', position: 'absolute'}}></div>
        <div style = {{width: `${sizes[1]}px`, height: `${sizes[1]}px`, background: 'black', position: 'absolute', right: '0px'}}></div>
      </div>

      <h3>Distance range for targets</h3>
      <Box sx={{ width: 300 }}>
        <Slider
        getAriaLabel={() => 'Distance range'}
        value={dists}
        onChange={handleDist}
        valueLabelDisplay="auto"
        min = {30}
        max = {450}
        />
      </Box>

      <div style = {{position: 'relative', height: '100px'}}>
        <div style = {{width: `${dists[0]}px`, height: `10px`, background: 'black'}}></div>
        <br></br>
        <div style = {{width: `${dists[1]}px`, height: `10px`, background: 'black', position: 'absolute'}}></div>
      </div>

      <h3>Number of trials</h3>
      <Box sx={{ width: 300 }}>
      <Slider
        getAriaLabel={() => 'Number of trials'}
        value={numberTrials}
        onChange={handleNumTrials}
        valueLabelDisplay="auto"
      />
    </Box>
    <p>Trial {curTrial} out of {numTrials}</p>
    <>Distance range: {minDist} to {maxDist}</>
    </div>
  )
}

function Results() {
  let newRows : any[] = [];
  let buckets = new Map();
  let highest_bucket = 0
  let highest_seconds = 0
  for (let i = 0; i < dataRows.length; i++){
    let datum = dataRows[i];
    let bucket = (Math.floor(2*datum["ID"])/2).toFixed(2);
    if (highest_bucket < Number(bucket)){
      highest_bucket = Number(bucket);
    }
    if (highest_seconds < datum["seconds"]){
      highest_seconds = datum["seconds"]
    }
    if (buckets.has(bucket)){
      let buck_list = buckets.get(bucket)
      buck_list.push(datum["seconds"])
      buckets.set(bucket, buck_list)
    } else {
      buckets.set(bucket, [datum["seconds"]])
    }
  }
  let lrx: number[] = []
  let lry: number[] = []
  for (var [bucket, times] of buckets) {
    let average_seconds = 0
    for (let i = 0; i < times.length; i++){
      average_seconds += times[i];
    }
    average_seconds = average_seconds / times.length;
    newRows.push({x: Number(bucket), y: average_seconds});
    lrx.push(Number(bucket))
    lry.push(average_seconds)
  }
  //Linear regression
  var n = lry.length;
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var sum_yy = 0;

  for (var i = 0; i < lry.length; i++) {

      sum_x += lrx[i];
      sum_y += lry[i];
      sum_xy += (lrx[i]*lry[i]);
      sum_xx += (lrx[i]*lrx[i]);
      sum_yy += (lry[i]*lry[i]);
  } 

  let lr_slope = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
  let lr_intercept = (sum_y - lr_slope * sum_x)/n;
  let lr_r2 = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
  let line_data = [{x: 0, y: lr_intercept}, 
                   {x: highest_bucket, y: (lr_slope*highest_bucket + lr_intercept)}]

  return (
    <div>
      <VictoryChart>
        <VictoryScatter data = {newRows}></VictoryScatter>
        <VictoryLine data = {line_data}></VictoryLine>
        <VictoryLabel text="Seconds" x={30} y={30} textAnchor="middle"/>
        <VictoryLabel text="ID" x={60} y={265} textAnchor="middle"/>
      </VictoryChart>
      <p>Fitts' Law says that movement time (MT) is a combination of target distance (D) and width (W), as specified 
        by the following formula: MT = a + b*ID, where ID = log(2D/W). R^2 is a measure of the linearity of a regression,
        and in this case refers to how closely your results follow Fitts' Law.</p>
      <p>According to your data, the parameters for your input device are:</p>
      <ul>
        <li><b>Delay:</b> {lr_intercept}</li>
        <li><b>Acceleration:</b> {lr_slope}</li>
        <li><b>R^2:</b> {lr_r2}</li>
      </ul>
    </div>
  )
}

function Experiment() {
  const [active, setActive] = useState(false);
  const [trial, setTrial] = useState(false);
  //Are we running an experiment?
  if (active){
    //Are we in a trial?
    if (trial){
      //Random size
      let size = Math.max(minSize, (Math.random() * maxSize));
      //Random location
      let dist = Math.random()*(maxDist - minDist) + minDist
      //let left = Math.max(5 + size, ((Math.random() * dist)));
      let left = (Math.random() * dist);
      //let top = Math.max(5 + size, ((Math.random() * screenHeight) - size));
      //let top = Math.max(5 + size, (Math.sqrt(1 + dist ** 2 - left ** 2)));
      let top = Math.sqrt(1 + dist ** 2 - left ** 2);
      let start = Date.now();
      return (
        <div style = {{justifyContent: 'center', width: '600px'}}>
          <div style={{display: 'inline-block', width: '100%', height: '500px', background: `rgb(${r},${g},${b})`, position: 'relative'}}>
            <div style = {{position: 'absolute',  width: `${size}px`, height: `${size}px`, left: `${left}px`, top:`${top}px`, background: 'black'}} 
            onClick={() => {
              curTrial += 1;
              setTrial(false);
              dataRows.push({width: size,
                             distance: Math.sqrt((left^2) + (top^2)),
                             seconds: (Date.now()-start)/1000,
                             ID: Math.log2((2*Math.sqrt((left ** 2) + (top ** 2)))/size)}
                             )
            }}
            >
            </div>
          </div>
        </div>
      )
    } else {
      //Are we finished all the trials? If not, keep going!
      if (curTrial < numTrials) {
        console.log("here")
        //Return reset screen
        return (
        <div style = {{justifyContent: 'center', width: '600px'}}>
          <div style={{display: 'inline-block', width: '100%', height: '500px', background: `rgb(${r},${g},${b}, ${alpha})`, position: 'relative'}}>
            <div style = {{position: 'absolute',  width: `25px`, height: `25px`, background: 'black'}} 
            onClick={() => {
              setTrial(true);
            }}
            >
            </div>
          </div>
        </div>
      )
      }
      //If so, we end!
      else {
        const csvConfig = mkConfig({ useKeysAsHeaders: true });
        const csv = generateCsv(csvConfig)(dataRows);
        const csvBtn = document.getElementById("csv_button");
        return (
          <div style = {{justifyContent: 'center', width: '600px'}}>
            <br></br>
            <Button style = {{background: "rgb(0,200,0"}}
              onClick={() => {
              setActive(false);
              curTrial = 0;
              }}
              >
              Reset
            </Button>
            <div style={{display: 'inline-block', width: '100%', height: '500px', background: `rgb(${r},${g},${b})`, position: 'relative'}}>
            </div>
            <Button
              onClick={() => {
                download(csvConfig)(csv);
              }}
              >
              Download CSV of results
            </Button>
            <Results/>
          </div>
          )
      }
    }
  } else {
    return (
      <div style = {{justifyContent: 'center', width: '600px'}}>
        <br></br>
        <Button style = {{background: "rgb(0,200,0"}}
          onClick={() => {
            setActive(true);
          }}
          >
          Begin Experiment
        </Button>
        <br></br>
        <div style={{display: 'inline-block', width: '100%', height: '500px', background: `rgb(${r},${g},${b})`, position: 'relative'}}>
        </div>
      </div>
      )}
}
