"use client";
import styles from "../page.module.css";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import Slider from '@mui/material/Slider';
import { mkConfig, generateCsv, download } from "export-to-csv";
import { VictoryScatter, VictoryLine, VictoryChart, VictoryLabel, VictoryAxis } from 'victory';

export default function Lab3() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h2>Lab 3: Evaluating Pointing Devices</h2>
        <p>In this week's lab, you will be comparing <b>two</b> different pointing devices. To complete this lab, do the following:</p>
        <ol>
          <li>Pick two different pointing devices (note that if you do not have two different devices, you can use two different levels of mouse sensitivity on your computer, or compare your right hand and left hand).</li>
          <li>Complete both a Fitts' law task and a steering task below, using <b>both of your two devices</b>.</li>
        </ol>
        <br></br>
        <p>Once you've done that, answer the following questions:</p>
        <ol>
          <li>Which two devices (or sensitivities, or hands, etc) did you pick?</li>
          <li>How did your results compare between the two? Consider throughput (speed) and accuracy for both pointing and steering tasks.</li>
          <li>Pick <b>at least one</b> additional variable you might test when comparing pointing devices (that is, something besides speed or accuracy). How might you test it?</li>
        </ol>
        <br></br>
        <p>To conduct the experiment, set up the parameters below, then click "begin experiment." You will alternate between clicking a 
          square in the top-left corner, and a target. Try to click the targets as fast as you can. There is no penalty for inaccuracy.
          When you're done, you'll have the option to download a CSV of your data. 
        </p>
      </div>
      <br></br>
      <h2>Fitts' Law Experiment</h2>
      {FittsExperiment()}
      <br></br>
      <h2>Accuracy Experiment</h2>
      <br></br>
      <h2>Steering Experiment</h2>
      {SteeringExperiment()}
    </main>
  );
}

let alpha = 1;
let r = 200;
let b = 200;
let g = 200;

let screenWidth = window.screen.width / 2;
let screenHeight = 400;
let maxSize = 60;
let minSize = 10;
let maxDist = 240;
let minDist = 30

let numTrials = 25;
let curTrial = 0;

let dataRows : any[] = [];

function FittsResults() {
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
        <li><b>Delay (a):</b> {lr_intercept}</li>
        <li><b>Acceleration (b):</b> {lr_slope}</li>
        <li><b>R^2:</b> {lr_r2}</li>
      </ul>
    </div>
  )
}

function FittsExperiment() {
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
            <FittsResults/>
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

//Accuracy Experiment
let minPathWidth = 10 
let maxPathWidth = 80
let minPathLength = 200
let maxPathLength = 550

let steerTrials = 25 
let curSteerTrial = 0

let steeringRows : any[] = [];

function SteeringResults() {
  console.log("results")
  let newRows : any[] = [];
  let buckets = new Map();
  let highest_bucket = 0
  let highest_seconds = 0
  let num_errors = 0
  console.log(steeringRows)
  for (let i = 0; i < steeringRows.length; i++){
    let datum = steeringRows[i];
    if (datum["error"] == 0){
      let bucket = (Math.ceil(datum["aw"])/5)*5;
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
    } else {
      num_errors += 1;
    }
  }
  console.log(buckets)
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
  console.log(newRows)
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
        <VictoryLabel text="A/W" x={60} y={265} textAnchor="middle"/>
      </VictoryChart>
      <p>The Accot–Zhai steering law says that, for a straight tunnel, the time it takes to move a cursor through it can be approximately represented by the model:
        T = a + b*(A/W), where T is time, A is the length of the tunnel, W is the width of the tunnel, and a and b are constants.</p>
      <p>According to your data, the parameters for your input device are:</p>
      <ul>
        <li><b>Delay (a):</b> {lr_intercept}</li>
        <li><b>Acceleration (b):</b> {lr_slope}</li>
        <li><b>R^2:</b> {lr_r2}</li>
        <><b>Number of errors:</b> {num_errors}</>
      </ul>
    </div>
  )
}

function SteeringExperiment() {
  const [active, setActive] = useState(false);
  const [trial, setTrial] = useState(false);
  //Are we running an experiment?
  if (active){
    console.log(curSteerTrial)
    console.log(steerTrials)
    //Are we in a trial?
    if (trial){
      //Random width
      let width = Math.random()*(maxPathWidth - minPathWidth) + minPathWidth;
      //Random length
      let length = Math.random()*(maxPathLength - minPathLength) + minPathLength;
      let start = Date.now();
      console.log(width)
      return (
        <div style = {{justifyContent: 'center', width: '600px'}}>
          <div style={{display: 'flex', alignItems: 'center', width: '100%', height: '500px', background: `rgb(${r},${g},${b})`, position: 'relative'}}>
            <div style = {{position: 'relative',  width: `${length}px`, height: `${width}px`, background: 'blue'}} 
            onMouseLeave={() => {
              setTrial(false);
              steeringRows.push({width: width,
                             length: length,
                             aw: length/width,
                             seconds: (Date.now()-start)/1000,
                             error: 1}
                             )
            }}
            >
              <div style = {{marginLeft: 'auto', marginRight: '0px', background: 'red', width: '50px', height: width}} 
              onMouseEnter={() => {
                setTrial(false);
                curSteerTrial += 1
                steeringRows.push({width: width,
                               length: length,
                               aw: length/width,
                               seconds: (Date.now()-start)/1000,
                               error: 0}
                               )
              }}
              ></div>
            </div>
          </div>
        </div>
      )
    } else {
      //Are we finished all the trials? If not, keep going!
      if (curSteerTrial < steerTrials) {
        //Return reset screen
        return (
        <div style = {{justifyContent: 'center', width: '600px'}}>
          <div style={{display: 'flex', alignItems: 'center', width: '100%', height: '500px', background: `rgb(${r},${g},${b}, ${alpha})`, position: 'relative'}}>
            <div style = {{position: 'relative',  width: `${minPathWidth}px`, height: `${minPathWidth}px`, verticalAlign: "middle", background: 'black'}} 
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
        const csv = generateCsv(csvConfig)(steeringRows);
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
            <SteeringResults/>
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
