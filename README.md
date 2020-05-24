## Eye tracking visualization tool for the 2IOA0 course at TU/e

The project is run on a server that is publicly accessible and can be found at https://eyevis.dobbel.dev


### Running

To run this project for yourself, you will need to have Node.js installed. Then go into the root of the project and install the required packages with:

```
npm install
```

Then go into the 'src' folder and run:

```
node main.js
```

It can then be accessed through the browser at port 8181 (e.g. http://localhost:8181).

### Current features

The application currently supports uploading .zip files containing datasets in the form of .csv files and stimuli in the form of .jpg files. It processes these and instantly makes them available to the client(s). Then these datasets can be visualized using multiple visualization types. There are five of these, of which three are currently functional; the scanpath, heatmap and scarf plot. To do this, select the dataset in the 'Dataset' menu (if there are any present, if not, upload one) and the stimulus (and optionally a specific user). Then each menu item contains a button to start the respective visualization. The scanpath allows for zooming and changing the colors of the dots and lines. The heatmap also allows zooming. The scarf plot does not yet allow zooming, but does allow setting the size of the grid for the AOIs (which are not yet shown on top of the stimulus).
