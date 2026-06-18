/*
 **********************************************************************
 * File       : data/lesson-03-student.cjs
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   This module defines the data for Lesson 3 - Lists
 **********************************************************************
 */

const lessonData = {
  lesson: {
    number: 3,
    title: "Lists",
    page_title: "Lesson 3 - Lists",
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
                  In this lesson, you will learn about lists
                  <button
                    type="button"
                    popovertarget="glossary-popover"
                    class="glossary-icon-button"
                    data-glossary-term="list"
                    aria-label="Show List definition">
                    <i class="fa-duotone fa-circle-question" aria-hidden="true"></i>
                  </button>
                  in HTML. By the end of this lesson, you will understand how to structure your web pages using
                  different types of lists.
                </p>
              </div>
            </div>
`,
    },
    {
      section: true,
      section_id: "lists",
      class_list: "lesson-section hidden",
      aria_label: "Lists in HTML",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <h3 class="lesson-title">What are lists?</h3>
            <div id="lists-block">
              <p>
                Lists are a fundamental part of HTML that allow you to group related items together. There are three
                types of lists in HTML: unordered lists (<code>&lt;ul&gt;</code>), ordered lists
                (<code>&lt;ol&gt;</code>), and description lists (<code>&lt;dl&gt;</code>). Each type of list serves a
                different purpose and is used to structure content in a way that is meaningful to users and assistive
                technologies.
              </p>
            </div>
`,
    },
    {
      section: true,
      section_id: "unordered-lists",
      class_list: "lesson-section hidden",
      aria_label: "Unordered Lists",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <h3 class="lesson-title">Unordered Lists</h3>
            <div id="unordered-lists-block">
              <p>
                An unordered list is used to group items that do not have a specific order. Each item in an unordered
                list is typically displayed with a bullet point. To create an unordered list, you use the
                <code>&lt;ul&gt;</code> tag, and each item within the list is defined using the
                <code>&lt;li&gt;</code> tag.
              </p>
              <p>Unordered lists:</p>
              <ul>
                <li>Are used for items that do not need to be in a specific order.</li>
                <li>Display each item with a bullet point by default.</li>
                <li>Are created using the <code>&lt;ul&gt;</code> tag,</li>
                <li>
                  Can contain multiple items, each defined by a
                  <code>&lt;li&gt;</code> tag.
                </li>
              </ul>
            </div>
`,
    },
    {
      section: true,
      section_id: "ordered-lists",
      class_list: "lesson-section hidden",
      aria_label: "Ordered Lists",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <h3 class="lesson-title">Ordered Lists</h3>
            <div id="ordered-lists-block">
              <p>
                An ordered list is used to group items that have a specific order or sequence. Each item in an ordered
                list is typically displayed with a number or letter to indicate its position in the list. To create an
                ordered list, you use the
                <code>&lt;ol&gt;</code> tag, and each item within the list is defined using the
                <code>&lt;li&gt;</code> tag.
              </p>
              <p>Ordered lists:</p>
              <ol>
                <li>Are used for items that need to be in a specific order.</li>
                <li>Display each item with a number by default.</li>
                <li>Are created using the <code>&lt;ol&gt;</code> tag,</li>
                <li>
                  Can contain multiple items, each defined by a
                  <code>&lt;li&gt;</code> tag.
                </li>
              </ol>
            </div>
`,
    },
    {
      section: true,
      section_id: "description-lists",
      class_list: "lesson-section hidden",
      aria_label: "Description Lists",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <h3 class="lesson-title">Description Lists</h3>
            <div id="description-lists-block">
              <p>
                A description list is used to group terms and their corresponding descriptions. It is often used for
                glossaries, FAQs, or any situation where you want to pair a term with a definition or description. To
                create a description list, you use the <code>&lt;dl&gt;</code> tag, with each term defined by a
                <code>&lt;dt&gt;</code> tag and each description defined by a <code>&lt;dd&gt;</code> tag.
              </p>
              <p>Description lists:</p>
              <dl>
                <dt>Usage</dt>
                <dd>Are used for pairing terms with descriptions.</dd>
                <dt>Differences</dt>
                <dd>
                  Are different from other list types in that they pair terms with descriptions rather than just listing
                  items.
                </dd>
                <dt>Term</dt>
                <dd>Use the <code>&lt;dt&gt;</code> tag to define a term.</dd>
                <dt>Description</dt>
                <dd>Use the <code>&lt;dd&gt;</code> tag to define the description for the term.</dd>
                <dt>Multiple pairs</dt>
                <dd>Can contain multiple term-description pairs.</dd>
              </dl>
            </div>
`,
    },
    {
      section: true,
      section_id: "why-use-lists",
      class_list: "lesson-section hidden",
      aria_label: "Why use lists?",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <h3 class="lesson-title">Why use lists?</h3>
            <div id="why-use-lists-block">
              <p>
                Lists are an important part of structuring content on a web page. They help to organise information in a
                way that is easy for users to read and understand. Additionally, using the appropriate list elements can
                improve accessibility for users who rely on assistive technologies, as it provides a clear structure for
                the content.
              </p>
              <p>
                In later lessons you will learn how lists can be used to create navigation menus and other interactive
                elements.
              </p>
              <p>
                You can put any valid HTML content inside a list item, including text, images, links, and even other
                lists. Lists defined in this way are called nested lists and the bullet points or numbers will be change
                depending on the level of nesting. When you have learned about CSS you will be able to style these lists
                to match the design of your web page.
              </p>
            </div>
`,
    },
    {
      section: true,
      section_id: "third-web-page",
      class_list: "lesson-section hidden",
      aria_label: "Third Web Page",
      content: `

            <div class="student-image">
              <!--Image is injected based on choices made in student.html and saved into local storage. -->
            </div>
            <h3 class="lesson-title">Creating a Web Page with Lists</h3>
            <div id="third-web-page-block">
              <p>
                Now that you know about lists, let's create a simple web page that uses them. You can use the code
                snippet provided in the next section as a starting point. This code includes all three types of lists:
                unordered lists, ordered lists, and description lists and a nested list example.
              </p>
              <p>Here are the steps to create your web page:</p>
              <ol>
                <li>Open Visual Studio Code.</li>
                <li>
                  Select <code>File-&gt;Open Folder</code> and choose the Projects folder you created earlier for your
                  web development work.
                </li>
                <li>Create a new file named <code>lesson-3.html</code> in the Projects folder.</li>
                <li>Type the code in the next screen into the file.</li>
                <li>Save the file.</li>
                <li>
                  Make sure the node.js server is running. You can do this by opening a terminal, navigating to your
                  Projects folder, and running <code>npm start</code>.
                </li>
                <li>
                  Open <code>http://localhost:8000/lesson-3.html</code> in your web browser to see your next web page!
                </li>
              </ol>

              <p>You should see something like this:</p>
              <figure class="clickable-image-figure">
                <button
                  type="button"
                  class="image-button"
                  data-image-src="../images/screenshots/lesson-3.png"
                  data-image-caption="Lesson 3 Screenshot"
                  tabindex="0"
                  aria-label="Click to view larger image">
                  <picture>
                    <img src="../images/screenshots/lesson-3.png" alt="Lesson 3 Screenshot" class="screenshot">
                  </picture>
                </button>
                <figcaption>Figure 3.1: Lesson 3 Screenshot (Click to enlarge)</figcaption>
              </figure>

              <p></p>
            </div>
`,
    },
    {
      section: true,
      section_id: "lists-code",
      class_list: "lesson-section hidden",
      aria_label: "Code for Your Lists Page",
      content: `

            <h3 class="lesson-title">Code for Your Lists Page</h3>
            <div class="code-snippet-container" data-src="../lessons/lesson-3.html">
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
                  Lines 15-19: This is the <em>unordered list</em> which starts with the <code>&lt;ul&gt;</code> tag and
                  ends with the <code>&lt;/ul&gt;</code> tag. Each item in the list is represented by a
                  <code>&lt;li&gt;</code> element. Note that the <code>&lt;li&gt;</code> items are indented. This is not
                  required, but it helps with readability.
                </li>
                <li>
                  Lines 23-27: This is the <em>ordered list</em> which starts with the <code>&lt;ol&gt;</code> tag and
                  ends with the <code>&lt;/ol&gt;</code> tag. Each item in the list is represented by a
                  <code>&lt;li&gt;</code> element, similar to the unordered list. The difference is that the browser
                  will automatically number these items.
                </li>
                <li>
                  Lines 31-38: This is a <em>definition list</em> which starts with the <code>&lt;dl&gt;</code> tag and
                  ends with the <code>&lt;/dl&gt;</code> tag. Each term is represented by a
                  <code>&lt;dt&gt;</code> element, and each description is represented by a
                  <code>&lt;dd&gt;</code> element. Note that there is no <code>&lt;li&gt;</code> element in a definition
                  list and that each item needs both a term and a description.
                </li>
                <li>
                  Lines 42-55: This is a <em>nested list</em> which starts with a <code>&lt;ul&gt;</code> tag and
                  contains another <code>&lt;ul&gt;</code> or <code>&lt;ol&gt;</code> inside it. Nested lists are used
                  to create sub-items within a list item. Note that the browser automatically changes the bullet points
                  it displays in nested lists. Also note carefully where the <code>&lt;/li&gt;</code> tags are placed.
                  The entire nested list should be contained between the <code>&lt;li&gt;</code> and
                  <code>&lt;/li&gt;</code> tags. This is where indentation is particularly helpful to ensure you can see
                  the structure of the list and avoid mistakes with where the closing tags go.
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
                <li>Adding more items to the lists.</li>
                <li>Play with the nested list. What does an ordered list look like inside an ordered list?</li>
                <li>Try adding a third level of nesting.</li>
                <li>Try putting different types of content inside the list items, such as headings and paragraphs.</li>
                <li>If you have done the next lesson on images, try adding images inside your list items.</li>
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
                Congratulations! You have created another web page using HTML. In the next lesson you will learn how to
                add images to your web pages.
              </p>
              <div id="wand-container" class="wand-container"></div>
            </div>
`,
    },
  ],
};

module.exports = lessonData;
