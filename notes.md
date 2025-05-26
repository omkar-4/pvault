Do Outline SpeedRunning : Recursively Outline MVP -> speedrun filling it in -> Only then go back and perfect. (no color, no button styling XD no complexity, no ui stuff)

Recursive Outline Algorithm -

1. Make outline of project
2. For each item in the outline, make an outline. Do this recursively until items are small
3. Fill in each item as fast as possible
4. Do not perfect as you go
5. Once done go back and perfect

> local app - local database (no mongo db)

What to build?

- Desktop Cross-platform OS Local Storage Encrypted Password Manager with pass encrypted password shareability (database can be shared, but will only work on my app)

## Outline -

1. App start

- when app starts, check if it is first time

  - check for the firstTime flag in the SQLCypher (sqlite + 256bit-AES encryption db) database

    - if firstTime flag is true/yes
    - If yes => open onboarding screen [set master password]

      - ask for

        - name
        - master password
        - confirm master password
        - recovery question
        - recovery answer
        - recovery pin

      - if valid :

        - set firstTime flag to false
        - encrypt master password
        - encrypt recovery answer
        - encrypt recovery pin
        - store in SQLCypher

          - in the end => open login screen

    - If no => open login screen [enter master password]
      - If correct password - open main screen
      - If forgot password - open recovery screen (have a go-back button)
        - fetch recovery question from backend/db
        - If answer is correct - open 'set new master password' screen
        - If answer is incorrect - retry
          - retry until correct or until 4 attempts
            - If correct, open 'set new master password' screen
            - if 4 attempts over - open 'method 2 recovery - pin entry' screen (have go-back button)
              - enter 6 digit pin
                - if correct - open 'set new master password' screen
                - if incorrect - try until correct, else stay stuck
    - If back pressed from recovery window, come back to login screen

2. Main Screen
