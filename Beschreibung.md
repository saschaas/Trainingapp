#Beschreibung.md

## Project Overview

THis will be a fitness tracker application to track the progress of my trainings over time. For each training session I will use this application to input my training progress for several different exercises. These exercises will be organised in different exercise-days which are made of several exercises. The exercises will be inputtet by the user and then added by the user to the different exercise-days. These exercise-days will then be organized in a specific order and be repeated thorugh the week and month to follow. It will always be the same order, but exercise-days can be skipped. All the perfomred trainings must be tracked in a local database. During the exercise the user inputs the training progress: the weight per exercise and the repetition and the number of sets (see below).

##Excercise
An exercise is defined by the user by:
- name
- category: Brust, Schulter, Trizeps, Bauch, Rücken, Bizeps, Beine
- focus: Lat, Mittlerer-Rücken, Rücker-Variation, Brust-komplett, Obere-Brust, Untere-Brust, Mittlere-Brust, Brust-Isolation, Schulter-komplett, Seitliche-Schulter, Hintere-Schultern, Trapez, Trizepts-komplett, Trizeps-Isolation, Trizeps-Variation, Core, Core-Stabilität, Bizepts-komplett, Bizeps-Variation, Beine-komplett, Quadrizeps-Isolation, Hamstrings, Gesäß, Waden, 

##Excercise-day
An exercise-day is defined by:
- name
- Excercise
- number of sets (a set are the number of times an excercise is repeated before going to the next)
- category: push, pull, legs, full-body
- position: this will be a number indicating the position of the excercise, so there is a order in which the excercises are repeated. This will be just a number starting with 1 for the first excercise and then 2, 3, ...

There are multiple exercises in one exercise-day. These are the exercises that are done on one day of working out. Whgen the user is performing these exercises, he will keep track of the progress he makes (See Training).

##Training
During the trianing the user inputs his training progress for each excercise and each set. The excercise-day will be automatically selected based on the last excercise done and the next in order.
The user inputs his training progress during the training as follows:
For each excercise and set:
- weight
- number repetitions
The app should select the first excercise when the training is started and with a tab the selection should switch from weight to repetitions and to the next set. There must be inputs for each set of the excercise.
The user can decide to skip an excercise of a set. The skipped sets or excercises will not be relevant for the statistic (will be implemented later).

##Volume
During the training the app will automatically calculate the volume of each set and the total volume of the excercise-day. It will also use the past training data to calculate a mean of the past volume per excercise and excercise-day and display this as marker in a progress bar of the volume. Skipped excercises should not be part of the calculation.

##Configuration
The user should be able to configure different excercises, exercise-days in a modern UI. These can be changed at any time by the user to adapt the trianing. The configuration should be saved in the database.

##User Interface:
The user interface should be a modern interface displaying the excercise-days to the user and letting him input his progress and saving it after the training is finished. The app will calculate the current training volume (weight*repetitions for the complete training and the excercise). Please see screenshot UI.jpg for an example of a userinterface, but feel free to adapt this and make ti more modern or user freindly.

##Database
The local database should save all trainings with the weights and repetitions made. 

##Architecture
It should be a modern web application with a connected database. There should be the possibility for real time updates during the training session, so a js based framework or similar should be used.
No server should be neeeded as the web app should run on its own.
No autentication is needed for now.

##Testing
Please make sure to test the app to verify the correct functioning. You can use the playwright-mcp or chrome-dev tools for this.

Please make sure to plan this app in depth before implementing it. Research for the best ways to organize this app and how to best impelement such an application the best way.

