"use client";
import styles from "../page.module.css";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import Slider from '@mui/material/Slider';
import { mkConfig, generateCsv, download } from "export-to-csv";

export default function Lab3() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h2>Lab 3: Fitts' Law</h2>
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

var alpha = 1;
var r = 200;
var b = 200;
var g = 200;

var screenWidth = window.screen.width / 2;
var screenHeight = 400;
var maxSize = 80;
var minSize = 10;

var numTrials = 10;
var curTrial = 0;

var dataRows : any[] = [];

function ExpOptions(){
  const [sizes, setSizes] = useState([20,80])
  const handleSize = (event: Event, newValue: number | number[]) => {
    setSizes(newValue as number[]);
    minSize = sizes[0];
    maxSize = sizes[1];
  };

  const [numberTrials, setNumTrials] = useState(25)
  const handleNumTrials = (event: Event, newValue: number | number[]) => {
    setNumTrials(newValue as number);
    numTrials = numberTrials;
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
      <h3>Number of trials</h3>
      <Box sx={{ width: 300 }}>
      <Slider
        getAriaLabel={() => 'Number of trials'}
        value={numberTrials}
        onChange={handleNumTrials}
        valueLabelDisplay="auto"
      />
    </Box>
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
      var size = Math.max(minSize, (Math.random() * maxSize));
      //Random location
      var left = Math.max(5 + size, ((Math.random() * screenWidth) - size));
      var top = Math.max(5 + size, ((Math.random() * screenHeight) - size));
      var start = Date.now();
      return (
        <div style = {{justifyContent: 'center', width: '50vw'}}>
          <div style={{display: 'inline-block', width: '100%', height: '400px', background: `rgb(${r},${g},${b})`, position: 'relative'}}>
            <div style = {{position: 'absolute',  width: `${size}px`, height: `${size}px`, left: `${left}px`, top:`${top}px`, background: 'black'}} 
            onClick={() => {
              curTrial += 1;
              setTrial(false);
              dataRows.push({width: size,
                             distance: Math.sqrt((left^2)*(top^2)),
                             seconds: (Date.now()-start)/1000}
                             )
              console.log(dataRows)
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
        <div style = {{justifyContent: 'center', width: '50vw'}}>
          <div style={{display: 'inline-block', width: '100%', height: '400px', background: `rgb(${r},${g},${b}, ${alpha})`, position: 'relative'}}>
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
          <div style = {{justifyContent: 'center', width: '50vw'}}>
            <br></br>
            <div style={{display: 'inline-block', width: '100%', height: '400px', background: `rgb(${r},${g},${b})`, position: 'relative'}}>
            <Button style = {{position: 'relative', top: '50%', left: '50%',translate: '(-50%, -50%)'}}
              onClick={() => {
                download(csvConfig)(csv);
              }}
            >
          Download CSV of results
        </Button>
            </div>
          </div>
          )
      }
    }
  } else {
    return (
      <div style = {{justifyContent: 'center', width: '50vw'}}>
        <br></br>
        <div style={{display: 'inline-block', width: '100%', height: '400px', background: `rgb(${r},${g},${b})`, position: 'relative'}}>
        <Button style = {{position: 'absolute', top: '45%', left: '45%', translate: '(-50%, -50%)'}}
          onClick={() => {
            setActive(true);
          }}
        >
      Begin Experiment
    </Button>
        </div>
      </div>
      )}
}
