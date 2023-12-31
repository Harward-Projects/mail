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
    send_email(); // Call send_email function after preventing default
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

function updateEmailReadStatus(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      read: true,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Handels successfull status update if needed
      console.log('Email read status updated successfully.');
    })
    .catch((error) => {
      console.error('Error updating email read status:', error);
    });
}

function updateEmailArchivedStatus(email_id) {
  console.log('starting Archive status update!');
  // Retrieving archived status and conditionally flip it
  let isArchived = email.archived;
  if (isArchived) {
    isArchived = false;
  } else {
    isArchived = true;
  }
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      archived: isArchived,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Handels successfull status update if needed
      console.log('Email Archive status updated successfully.');
    })
    .catch((error) => {
      console.error('Error updating email read status:', error);
    });
}

function view_email(email_id) {
  updateEmailReadStatus(email_id);
  // If the email is unread, it should appear with a white background. If the email has been read, it should appear with a gray background.

  // Fetch the email details using the email_id
  fetch(`/emails/${email_id}`)
    .then((response) => response.json())
    .then((email) => {
      // Create a container to display the email details
      const emailContainer = document.createElement('div');

      // Customize the HTML structure based on your needs
      emailContainer.innerHTML = `
        <p><b>From: </b>${email.sender}</p>
        <p><b>To: </b>${email.recipients.join(', ')}</p>
        <p><b>Subject: </b>${email.subject}</p>
        <p><b>Timestamp: </b>${email.timestamp}</p>
        <hr>
        <p>${email.body}</p>
      `;

      // Append the email details to #emails-view container in the HTML
      document.querySelector('#emails-view').innerHTML = ''; // Clear existing content
      document.querySelector('#emails-view').appendChild(emailContainer);
    })
    .catch((error) => {
      console.error('Error fetching email details:', error);
    });
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
        emailDiv.classList.add(
          'border',
          'border-primary',
          'd-flex',
          'bd-highlight',
          'mb-3'
        );

        // Add CSS style for the hover effect
        emailDiv.style.cursor = 'pointer';

        // Customize the HTML structure for emails view
        emailDiv.innerHTML = `
        <div class='fw-bolder p-2 bd-highlight email-sender'>${sender.sender}</div>
        <div class='p-2 bd-highlight pe-none email-subject'>${sender.subject}</div>
        <div class='text-muted ms-auto p-2 flex-grow-3 bd-highlight email-timestamp'>${sender.timestamp}</div>
        `;

        //Set Background style of Read and Unread emails to white and gray consequently
        if (sender.read) {
          emailDiv.classList.add('p-3', 'mb-2', 'bg-secondary', 'text-white');
        } else {
          emailDiv.classList.add('p-3', 'mb-2', 'bg-white', 'text-dark');
        }

        emailDiv.addEventListener('click', function () {
          const emailId = sender.id;
          // Call a function to view the email using the retrieved emailId
          view_email(emailId);
        });

        // Append the email content to the #emails-view container
        document.querySelector('#emails-view').appendChild(emailDiv);
      });
    });
}

function send_email() {
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
      console.log(result.body);
      const element = document.createElement('div');
      element.innerHTML = result.body;
      document.querySelector('#emails-view').append(element);
      load_mailbox('sent');
    })
    .catch((error) => {
      console.error('Error during POST request:', error);
    });
}
