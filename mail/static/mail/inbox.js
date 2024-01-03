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

  // Prevent default submit click for compose-form
  const composeForm = document.querySelector('#compose-form');
  composeForm.addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('composeForm ID prevented');
    send_email(); // Call send_email function after preventing default
  });

  // Prevent default submit click for reply-form
  const replyForm = document.querySelector('#reply-form');
  replyForm.addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('replyForm ID prevented');
    send_email(); // Call send_email function after preventing default
  });
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#reply-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function reply_email(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'block';

  // Pre-fill composition fields
  const originalSubject = email.subject;
  const replySubject = originalSubject.startsWith('Re: ')
    ? originalSubject
    : `Re: ${originalSubject}`;

  const replyBody = `\n\n\n\n\n\n\n\nOn ${email.timestamp} ${email.sender} wrote:\n${email.body}`;

  document.querySelector('#reply-recipients').value = email.sender;
  document.querySelector('#reply-subject').value = replySubject;
  document.querySelector('#reply-body').value = replyBody;
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

function updateEmailArchivedStatus(email_id, isArchived) {
  console.log('starting Archive status update!');
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
      // Load the inbox after the status update is complete
      load_mailbox('inbox');
    })
    .catch((error) => {
      console.error('Error updating email read status:', error);
    });
}

function view_email(email_id, mailbox) {
  updateEmailReadStatus(email_id);

  // Fetch the email details using the email_id
  fetch(`/emails/${email_id}`)
    .then((response) => response.json())
    .then((email) => {
      // Create a container to display the email details
      const emailContainer = document.createElement('div');
      // Replace newline characters with HTML line break tags
      const formattedBody = email.body.replace(/\n/g, '<br>');
      // Customize the HTML structure based on mailbox
      emailContainer.innerHTML = `
        <p><b>From: </b>${email.sender}</p>
        <p><b>To: </b>${email.recipients.join(', ')}</p>
        <p><b>Subject: </b>${email.subject}</p>
        <p><b>Timestamp: </b>${email.timestamp}</p>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-outline-primary" id="replyButton">Reply</button>
          <button type="button" class="btn btn-outline-secondary" id="archiveButton">Archive</button>
          <button type="button" class="btn btn-outline-primary" id="unarchiveButton">Unarchive</button>
        </div>
        <hr>
        <p>${formattedBody}</p>
      `;

      // Append the email details to #emails-view container in the HTML
      document.querySelector('#emails-view').innerHTML = ''; // Clear existing content
      document.querySelector('#emails-view').appendChild(emailContainer);

      // Set the visibility of the "Archive" and "Unarchive" buttons based on the mailbox value and their functionalities pluse the "Reply" button
      const replyButton = document.getElementById('replyButton');
      const archiveButton = document.getElementById('archiveButton');
      const unarchiveButton = document.getElementById('unarchiveButton');

      switch (mailbox) {
        case 'inbox':
          archiveButton.style.display = 'block';
          unarchiveButton.style.display = 'none';
          break;
        case 'sent':
          archiveButton.style.display = 'none';
          unarchiveButton.style.display = 'none';
          break;
        case 'archive':
          archiveButton.style.display = 'none';
          unarchiveButton.style.display = 'block';
          break;
        default:
        // Handle other mailbox values as needed
      }

      replyButton.addEventListener('click', function () {
        // const email_id = sender.id;
        reply_email(email);
      });
      archiveButton.addEventListener('click', function () {
        // const email_id = sender.id;
        updateEmailArchivedStatus(email_id, email.archived);
      });
      unarchiveButton.addEventListener('click', function () {
        // const email_id = sender.id;
        updateEmailArchivedStatus(email_id, email.archived);
      });
    })
    .catch((error) => {
      console.error('Error fetching email details:', error);
    });
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';

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
          // Call a function to view the email using the retrieved email_id and its mailbox
          view_email(sender.id, mailbox);
        });

        // Append the email content to the #emails-view container
        document.querySelector('#emails-view').appendChild(emailDiv);
      });
    });
}

function send_email() {
  const composeView = document.getElementById('compose-view');
  const composeForm = document.getElementById('compose-form');
  const replyForm = document.getElementById('reply-form');

  // Check display state of one of the forms' parents and transfer visible form's data as myForm
  const myForm =
    composeView.style.display === 'block' ? composeForm : replyForm;

  // Create a FormData object from the form
  const plainObject = {};
  let formData;
  if (myForm) {
    formData = new FormData(myForm);
    // Convert FormData to a plain object
    formData.forEach((value, key) => {
      plainObject[key] = value;
    });
  }

  fetch('/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plainObject),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      const element = document.createElement('div');
      element.innerHTML = result.body;
      document.querySelector('#emails-view').append(element);
      load_mailbox('sent');
    })
    .catch((error) => {
      console.error('Error during POST request:', error);
    });
}
