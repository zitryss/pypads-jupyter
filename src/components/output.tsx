import React, { useEffect, useState } from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import Dataframe from './dataframe';
import { INotebookTracker, NotebookActions } from '@jupyterlab/notebook';
import NotebookUtils from '../utils/NotebookUtils';
import Graph from './graph';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core';

interface IProps {
  tracker: INotebookTracker;
  expId: string;
}

interface IDataFrame {
  columns: string[];
  index: string[];
  data: any[][];
}

const defaultDataFrame: IDataFrame = {
  columns: [],
  index: [],
  data: []
};

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  }
}));

export default function Ouput(props: IProps) {
  const classes = useStyles();
  const { tracker, expId } = props;
  const [df, setDf] = useState(defaultDataFrame);

  const getExpId = () => {
    return expId;
  };

  useEffect(() => {
    update();
    NotebookActions.executed.connect(update);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      NotebookActions.executed.disconnect(update);
    };
  }, [expId]);

  const update = (): Promise<void> => {
    const code =
      'tracker.api.end_run(); result = tracker.results.get_summary(experiment_id=' +
      getExpId() +
      ').to_json(orient="split"); tracker.api.start_run(experiment_id=' +
      getExpId() +
      ')';
    return NotebookUtils.sendKernelRequestFromNotebook(
      tracker.currentWidget,
      code,
      {
        result: 'result'
      }
    )
      .then((r: any) => {
        console.log('id from update Here is your id -> ' + getExpId());
        setDf(JSON.parse(r.result.data['text/plain'].slice(1, -1)));
      })
      .catch((r: any) => {
        console.log(r);
      });
  };

  return (
    <div className={classes.root}>
      <div>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>Dataframe</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Dataframe {...df} />
          </AccordionDetails>
        </Accordion>
      </div>
      <div>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>Graph</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Graph {...df} />
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
}
