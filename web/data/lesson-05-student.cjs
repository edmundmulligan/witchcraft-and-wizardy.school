/*
 **********************************************************************
 * File       : data/lesson-05-student.cjs
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   This module defines the data for Lesson 5 - Hyperlinks
 **********************************************************************
 */

const lessonData = {
  lesson: {
    number: 5,
    title: "Hyperlinks",
    page_title: "Lesson 5 - Hyperlinks",
  },
  common_sections: [
    {
      section: true,
      section_id: "introduction",
      class_list: "lesson-section",
      aria_label: "Introduction",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <div class="intro-content">
              <h3 class="lesson-title">Introduction</h3>
              <div id="introduction-block">
                <p>
                  In this lesson, you will learn about hyperlinks
                  <button
                    type="button"
                    popovertarget="glossary-popover"
                    class="glossary-icon-button"
                    data-glossary-term="hyperlink"
                    aria-label="Show Hyperlink definition">
                    <i class="fa-duotone fa-circle-question" aria-hidden="true"></i>
                  </button>
                  in HTML. By the end of this lesson, you will understand how to create and use hyperlinks to navigate
                  between web pages and other resources.
                </p>
              </div>
            </div>
`,
    },
    {
      section: true,
      section_id: "hyperlinks",
      class_list: "lesson-section hidden",
      aria_label: "Hyperlinks in HTML",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <h3 class="lesson-title">What are hyperlinks?</h3>
            <div id="hyperlinks-block">
              <p>
                Hyperlinks, or simply links, are what makes the World Wide Web a web. They allow you to connect one web
                page to another, or to other resources such as images, videos, or documents. In HTML, hyperlinks are
                created using the <code>&lt;a&gt;</code> (anchor) element
                <button
                  type="button"
                  popovertarget="glossary-popover"
                  class="glossary-icon-button"
                  data-glossary-term="anchor-element"
                  aria-label="Show Anchor Element definition">
                  <i class="fa-duotone fa-circle-question" aria-hidden="true"></i></button
                >. The <code>&lt;a&gt;</code> element has an attribute called <code>href</code> (hypertext reference)
                that specifies the URL of the page or resource you want to link to.
              </p>
              <p>
                You can also use other attributes like <code>target</code> to specify where the linked document will
                open, and <code>rel</code> to define the relationship between the current document and the linked
                document. The most common values for these attributes are <code>_blank</code> for
                <code>target</code> which opens the link in a new window and <code>noopener noreferrer</code> for
                <code>rel</code> which improves security and performance.
              </p>
            </div>
`,
    },
    {
      section: true,
      section_id: "types-of-hyperlinks",
      class_list: "lesson-section hidden",
      aria_label: "Types of Hyperlinks",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <h3 class="lesson-title">Types of Hyperlinks</h3>
            <div id="types-of-hyperlinks-block">
              <p>
                There are several types of hyperlinks in HTML, each serving a specific purpose. The most common ones
                are:
              </p>
              <ul>
                <li><code>&lt;a&gt;</code> for creating hyperlinks to other web pages or resources,</li>
                <li>
                  <code>&lt;link&gt;</code> for linking external resources like stylesheets, We'll cover this in more
                  detail when we get to the CSS lessons,
                </li>
                <li>
                  <code>&lt;area&gt;</code> for defining clickable areas within an image map, We'll cover this after you
                  learn how to use JavaScript to handle clicks,
                </li>
              </ul>
              <p>
                The <code>href</code> attribute in the <code>&lt;a&gt;</code> element can point to different types of
                resources, such as:
              </p>
              <ul>
                <li>Another web page (e.g., <code>https://www.example.com</code>)</li>
                <li>An email address (e.g., <code>mailto:info@example.com</code>)</li>
                <li>A file on the same server (e.g., <code>lesson-1.html</code>)</li>
                <li>
                  A specific section within the same page (e.g.,
                  <code>#section1</code>)
                </li>
              </ul>
              <p>
                The code that goes between the opening and closing
                <code>&lt;a&gt;</code> tags is the clickable text or content that users will see and interact with. It
                can be simple text or other HTML elements like images.
              </p>
            </div>
`,
    },
    {
      section: true,
      section_id: "second-web-page",
      class_list: "lesson-section hidden",
      aria_label: "Second Web Page",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <h3 class="lesson-title">Creating a Web Page with Hyperlinks</h3>
            <div id="second-web-page-block">
              <p>
                Now that you know about hyperlinks, let's create a simple web page that uses them. You can use the code
                snippet provided in the next section as a starting point. This code includes several hyperlinks to
                different types of resources, as well as some basic HTML structure using landmark elements.
              </p>
              <p>Here are the steps to create your web page:</p>
              <ol>
                <li>Open Visual Studio Code.</li>
                <li>
                  Select <code>File-&gt;Open Folder</code> and choose the Projects folder you created earlier for your
                  web development work.
                </li>
                <li>Create a new file named <code>lesson-5.html</code> in the Projects folder.</li>
                <li>Type the code in the next screen into the file.</li>
                <li>Save the file.</li>
                <li>
                  Make sure the node.js server is running. You can do this by opening a terminal, navigating to your
                  Projects folder, and running <code>npm start</code>.
                </li>
                <li>
                  Open <code>http://localhost:8000/lesson-5.html</code> in your web browser to see your next web page!
                </li>
              </ol>

              <p>You should see something like this:</p>
              <figure class="clickable-image-figure">
                <button
                  type="button"
                  class="image-button"
                  data-image-src="../images/screenshots/lesson-5.png"
                  data-image-caption="Lesson 5 Screenshot"
                  tabindex="0"
                  aria-label="Click to view larger image">
                  <picture>
                    <img src="../images/screenshots/lesson-5.png" alt="Lesson 5 Screenshot" class="screenshot">
                  </picture>
                </button>
                <figcaption>Figure 5.1: Lesson 5 Screenshot (Click to enlarge)</figcaption>
              </figure>
            </div>
`,
    },
    {
      section: true,
      section_id: "hyperlink-code",
      class_list: "lesson-section hidden",
      aria_label: "Code for Your Hyperlink Page",
      content: `

            <h3 class="lesson-title">Code for Your Hyperlink Page</h3>
            <div class="code-snippet-container" data-src="../lessons/lesson-5.html">
              <div class="code-snippet-table"></div>
            </div>
`,
    },
    {
      section: true,
      section_id: "what-does-it-mean",
      class_list: "lesson-section hidden",
      aria_label: "What does it mean",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <h3 class="lesson-title">What does it mean</h3>

            <div id="what-does-it-mean-block">
              <p>In this section, we will explain what the different parts of the HTML code you wrote mean.</p>
              <ul>
                <li>
                  Line 12: This is the <code>&lt;main&gt;</code> element we have used before, but this time it has an
                  <code>id</code> attribute with the value "top". This allows us to create a hyperlink that points to
                  this specific section of the page, which we will see later in the code.
                </li>
                <li>
                  Line 15: This is the first hyperlink in the code. It uses the
                  <code>&lt;a&gt;</code> element to create a link to an external web page (encyclopedia.com) that
                  provides more information about witches and wizards. The <code>href</code> attribute specifies the URL
                  of the page to link to, while the <code>target="_blank"</code> attribute ensures that the link opens
                  in a new tab or window. The <code>rel="noopener noreferrer"</code> attribute is used for security
                  reasons when opening links in a new tab.
                </li>
                <li>
                  Line 20: This is another hyperlink that wraps around an image. When the user clicks on the image, it
                  will take them to the Britannica page about Merlin. This demonstrates how you can use hyperlinks not
                  just with text, but also with images or other HTML elements.
                </li>
                <li>
                  Line 22: This is an <code>&lt;img&gt;</code> element that displays an image of Merlin. This is just
                  like images you have used in previous lessons, but by giving it a <code>src</code> attribute, you
                  didn't need to download the image and save it in your project folder. The image is loaded directly
                  from the web when the page is viewed. This is a common way to use images on the web, but be aware that
                  if the image is removed from the web or the URL changes, it will no longer display on your page.
                </li>
                <li>
                  Line 29: This is a hyperlink that uses the
                  <code>mailto:</code> protocol in the <code>href</code> attribute. When a user clicks on this link, it
                  will open their default email client with a new email draft addressed to the specified email address
                  (<code>info@witchcraft-and-wizardry.school</code>) and with a predefined subject line ("Question about
                  Witches and Wizards"). This is a convenient way to allow users to contact you directly from your web
                  page.
                </li>
                <li>
                  Line 30: Note the warning here about sending a real email. This is just a reminder that the email
                  address you put in the
                  <code>href</code> attribute of a <code>&lt;a&gt;</code> element will be visible to users and can be
                  used to send real emails. In this case, the email address is mine and I will most likely ignore any
                  emails sent to it. If you want to check that this really works, you can change the email address to
                  your own and try clicking the link to see if it opens your email client with a new draft email.
                </li>
              </ul>
            </div>
`,
    },
    {
      section: true,
      section_id: "be-curious",
      class_list: "lesson-section hidden",
      aria_label: "Be curious",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <div id="be-curious-block">
              <h3 class="lesson-title">Be curious</h3>
              <p>
                Once again, this is a chance to experiment and see what happens when you change things in your HTML
                code. Try modifying the code you wrote earlier in different ways, such as:
              </p>
              <ul>
                <li>Adding hyperlinks to other web pages or resources that you find interesting.</li>

                <li>
                  Add links to the previous lessons you have created (lesson-01.html to lesson-04.html), so that you can
                  easily navigate between them.
                </li>
                <li>
                  Try creating a list of hyperlinks using the
                  <code>&lt;ul&gt;</code> element to different witches and wizards you like, and link each one to a page
                  with more information about them.
                </li>
              </ul>
            </div>
`,
    },
    {
      section: true,
      section_id: "conclusion",
      class_list: "lesson-section hidden",
      aria_label: "Conclusion",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <div id="conclusion-block">
              <h3 class="lesson-title">Conclusion</h3>
              <p>
                Congratulations! You have created another web page using HTML. In the next lesson you will learn about
                tables. These are used to display data in a structured way, and can be very useful for organising
                information on your web pages.
              </p>
              <div id="wand-container" class="wand-container"></div>
            </div>
`,
    },
  ],
};

module.exports = lessonData;
