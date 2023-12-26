document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document
    .querySelector('#inbox')
    .addEventListener('click', () => load_mailbox('inbox'));
  document
    .querySelector('#sent')
    .addEventListener('click', () => load_mailbox('sent'));
  document
    .querySelector('#archived')
    .addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Prevent default submit click
  const composeForm = document.querySelector('#compose-form');
  composeForm.addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('composeForm class prevented');
    submit_email(); // Call submit_email function after preventing default
  });
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // Show existing emails if they exist
  fetch('/emails/' + mailbox)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((sender) => {
        const emailDiv = document.createElement('div');

        // Customize the HTML structure based on your needs
        emailDiv.innerHTML = `
        <p>From: ${sender.sender}</p>
        <p>Subject: ${sender.subject}</p>
        <p>Timestamp: ${sender.timestamp}</p>
        <p>Body: ${sender.body}</p><hr>
      `;

        // Append the email content to the #emails-view container
        document.querySelector('#emails-view').appendChild(emailDiv);
      });
    });
}

function submit_email() {
  console.log('submit_email called');

  const myForm = document.getElementById('compose-form');

  // Create a FormData object from the form
  const formData = new FormData(myForm);

  // Convert FormData to a plain object
  const plainObject = {};
  formData.forEach((value, key) => {
    console.log(`Key: ${key}, Value: ${value}`);
    plainObject[key] = value;
  });

  // Log the plainObject to inspect it
  console.log('plainObject:', plainObject);

  fetch('/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // body: JSON.stringify(formData),
    body: JSON.stringify(plainObject),
  })
    .then((response) => {
      console.log('Raw response', response);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      console.log(
        'This is the returned result = response.json().body: ',
        result.body
      );
      const element = document.createElement('div');
      element.innerHTML = result.body;
      document.querySelector('#emails-view').append(element);
    })
    .catch((error) => {
      console.error('Error during POST request:', error);
    });
}
