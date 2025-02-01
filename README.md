Feel free to audit the code or modify it to suit your needs.

# How to Install:

## Step 1. Use Google Chrome

## Step 2. Click on the green "code" button.
![text](/tutorial_images/Screenshot%202025-02-01%20at%201.08.03.png "Step 1.")

## Step 3. Click on "download ZIP"
![text](/tutorial_images/Screenshot%202025-02-01%20at%201.12.07.png "Step 2.")

## Step 4. Open the zip you've downloaded in a folder
It might look different on windows, but it's not your first time of downloading a file.
![text](/tutorial_images/Screenshot%202025-02-01%20at%201.13.25.png "Step 3.")

## Step 5. Open the extensions in Chrome
Click on the three dots on the top right corner to bring up the menu.
Then select extensions and manage extensions.
![text](/tutorial_images/Screenshot%202025-02-01%20at%201.17.46.png "Step 4.")

## Step 6. Enable developer mode
This will let you use your own extension.
![text](/tutorial_images/Screenshot%202025-02-01%20at%201.21.18.png "Step 5.")

## Step 7. Click on "load unpacked"
![text](/tutorial_images/Screenshot%202025-02-01%20at%201.22.02.png "Step 6.")

## Step 8. Select the folder which contains the files named "milovana_speech_clicker"
Important:
It's not the same folder you've downloaded as a .zip!
It's located WITHIN that.
![text](/tutorial_images/Screenshot%202025-02-01%20at%201.23.50.png "Step 7.")

## Step 9. Click on the extensions icon and pin it
You can unpin it if you wish or you can also bring it up using the extension icon and then clicking on it.
![text](/tutorial_images/Screenshot%202025-02-01%20at%201.26.43.png "Step 8.")

## Step 10. Open up a milovana webtease, open the extension (click on the icon) and then click "Start"
Give temporary access to your microphone and you're good to go.
When you're done and close the page it will stop listening, as indicated by the microphone icon (or the lack of it) in the top bar.
Click away from the extension popup and it will disappear, but continue to work.

If you say the text on the button the button will be clicked.

Note that it might mishear you sometimes, but that's on either you or the voice recognition.

Use this tool as you wish.

# How it works:
This is a bit more technical explanation of how it is achieved.
We inject the content.js script into the browser, and it detects whether it's in an iframe (which milovana uses to sandbox the teases).
Then it prompts the user to allow access to the microphone in order to use the voice recognition api.
When it recognizes a batch of words it matches them against the text on the buttons and chooses the best match, given that the match is also greater than 40%. This allows for mishearing a word, while also differentiating buttons that have similar texts.
It also has a built in homonym dictionary, so in theory it should allow for words that sound alike, like "come".
