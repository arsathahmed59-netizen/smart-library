"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Globe, Download, Eye, Search, CreditCard, Shield, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Check, ArrowRight } from "lucide-react";
import styles from "./page.module.css";

// Sample E-Books data
const EBOOKS_DATA = [
  {
    id: "eb1",
    title: "Deep Learning & Neural Networks",
    author: "Dr. Andrew Ng",
    category: "Artificial Intelligence",
    coverImage: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=300",
    downloads: 342,
    pagesCount: 12,
    fileSize: "4.8 MB",
    pages: [
      "Deep Learning (also known as deep structured learning) is part of a broader family of machine learning methods based on artificial neural networks with representation learning. Learning can be supervised, semi-supervised or unsupervised.",
      "Neural Networks are computing systems inspired by the biological neural networks that constitute animal brains. An ANN is based on a collection of connected units or nodes called artificial neurons.",
      "Activation Functions: An activation function of a node defines the output of that node given an input or set of inputs. Common functions include ReLU (Rectified Linear Unit), Sigmoid, and Tanh.",
      "Backpropagation is an algorithm widely used in the training of feedforward neural networks for supervised learning. It computes the gradient of the loss function with respect to the weights.",
      "Gradient Descent is a first-order iterative optimization algorithm for finding a local minimum of a differentiable function. To find a local minimum of a function, one takes steps proportional to the negative of the gradient.",
      "Convolutional Neural Networks (CNNs) are a class of deep neural networks, most commonly applied to analyze visual imagery. They are also known as shift invariant or space invariant ANNs.",
      "Recurrent Neural Networks (RNNs) are a class of artificial neural networks where connections between nodes can form a directed cycle. This allows it to exhibit temporal dynamic behavior.",
      "Generative Adversarial Networks (GANs) are a class of machine learning frameworks designed by Ian Goodfellow and his colleagues in 2014. Two neural networks contest with each other in a game.",
      "Transformers are deep learning models introduced in 2017, used primarily in the field of natural language processing (NLP). They utilize self-attention mechanisms to process inputs.",
      "Large Language Models (LLMs) are a type of artificial intelligence model designed to understand, generate, and manipulate human language. They are trained on massive datasets.",
      "Overfitting is a concept in data science where a statistical model fits its training data too well, leading to poor generalization on unseen validation or test datasets.",
      "Future of AI: Artificial General Intelligence (AGI) is the hypothetical intelligence of a machine that has the capacity to understand or learn any intellectual task that a human being can."
    ]
  },
  {
    id: "eb2",
    title: "Algorithms & Data Structures in Java",
    author: "Robert Sedgewick",
    category: "Computer Science",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=300",
    downloads: 219,
    pagesCount: 8,
    fileSize: "7.2 MB",
    pages: [
      "An Algorithm is a finite sequence of rigorous instructions, typically used to solve a class of specific problems or to perform a computation. They are specification for performing calculations.",
      "Data Structures are algebraic structures which provide structural organization of data. Common structures include Arrays, Linked Lists, Stacks, Queues, Trees, and Graphs.",
      "Asymptotic Analysis: Big O Notation is mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity.",
      "Sorting Algorithms: Sorting is the systematic ordering of elements. Common algorithms include Quick Sort, Merge Sort, Heap Sort, Bubble Sort, and Insertion Sort.",
      "Searching Algorithms: Binary Search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list.",
      "Graph Algorithms: Graphs consist of vertices connected by edges. Key traversal methods include Breadth-First Search (BFS) and Depth-First Search (DFS).",
      "Dynamic Programming is a method for solving complex problems by breaking them down into simpler subproblems. It solves subproblems once and stores their solutions using memoization.",
      "Complexity Tiers: O(1) Constant, O(log n) Logarithmic, O(n) Linear, O(n log n) Linearithmic, and O(n^2) Quadratic runtime models represent scalability thresholds."
    ]
  },
  {
    id: "eb3",
    title: "Advanced C Programming",
    author: "Dennis Ritchie",
    category: "Systems Engineering",
    coverImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=300",
    downloads: 512,
    pagesCount: 6,
    fileSize: "3.1 MB",
    pages: [
      "The C Programming Language is a general-purpose, procedural computer programming language supporting structured programming, lexical variable scope, and recursion.",
      "Pointers: A pointer is a programming language object whose value refers to (or points to) another value stored elsewhere in the computer memory using its address.",
      "Memory Allocation: Dynamic memory allocation is the allocation of memory storage for use in a computer program during runtime. Functions include malloc(), calloc(), realloc(), and free().",
      "Structures & Unions: Structs are user-defined data types that allow grouping of variables of different types. Unions hold only one member's value in the same memory slot at a time.",
      "Preprocessors: The C preprocessor is a macro preprocessor that transforms your program code before compilation. Directives begin with the '#' symbol (e.g. #include, #define).",
      "File Handling: In C, files are treated as streams of bytes. Functions like fopen(), fclose(), fread(), fwrite(), and fseek() manage file I/O operations."
    ]
  },
  {
    id: "eb4",
    title: "Verilog HDL & FPGA Synthesizer",
    author: "Samir Palnitkar",
    category: "Digital Electronics",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300",
    downloads: 189,
    pagesCount: 5,
    fileSize: "5.5 MB",
    pages: [
      "Verilog HDL (Hardware Description Language) is a language used to model electronic systems, most commonly digital circuits, at various levels of abstraction.",
      "Gate-Level Modeling: Circuits can be modeled using primitive logic gates such as and, or, not, xor, nand, and nor. System behavior is derived directly from component nets.",
      "Dataflow Modeling: Uses continuous assignment statements (assign) to describe the flow of data from inputs to outputs without explicitly declaring gate structures.",
      "Behavioral Modeling: Describes the algorithmic behavior of the circuit using procedural blocks (always, initial) and conditional statements.",
      "FPGA (Field Programmable Gate Array) is an integrated circuit designed to be configured by a customer or a designer after manufacturing - hence 'field-programmable'."
    ]
  }
];

// Sample Journals data
const JOURNALS_DATA = [
  {
    id: "jr1",
    title: "IEEE Transactions on Pattern Analysis & Machine Intelligence",
    publisher: "IEEE Computer Society",
    date: "May 2026",
    doi: "10.1109/TPAMI.2026.34091",
    abstract: "This journal covers research on all aspects of computer vision and image understanding, pattern analysis and recognition, and machine intelligence. Current focus includes Generative AI modeling paradigms and self-supervised learning networks."
  },
  {
    id: "jr2",
    title: "ACM Transactions on Embedded Computing Systems",
    publisher: "Association for Computing Machinery",
    date: "March 2026",
    doi: "10.1145/TECS.2026.54921",
    abstract: "Focuses on design methodologies, programming languages, architectures, software systems, and hardware platforms for cyber-physical and embedded devices. Features advancements in real-time edge intelligence."
  },
  {
    id: "jr3",
    title: "Journal of Artificial Intelligence Research (JAIR)",
    publisher: "AI Access Foundation",
    date: "April 2026",
    doi: "10.1613/jair.2026.11902",
    abstract: "An international open-access journal covering all areas of artificial intelligence. Key articles in this volume examine the reinforcement learning loops and explainability metrics for multi-agent autonomous devices."
  }
];

export default function DigitalHubPage() {
  const [activeTab, setActiveTab] = useState<"membership" | "ebooks" | "journals">("membership");
  const [user, setUser] = useState<{ name: string; email: string; id: string; role: string } | null>(null);
  const [libraryCode, setLibraryCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // E-Book Reader Modal State
  const [readingBook, setReadingBook] = useState<typeof EBOOKS_DATA[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const code = localStorage.getItem("libraryCode") || "AURA-MAIN";
    setLibraryCode(code);
  }, []);

  const handleReadBook = (book: typeof EBOOKS_DATA[0]) => {
    setReadingBook(book);
    setCurrentPage(0);
    setZoomLevel(100);
  };

  const handleNextPage = () => {
    if (readingBook && currentPage < readingBook.pages.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const filteredEbooks = EBOOKS_DATA.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJournals = JOURNALS_DATA.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.abstract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Title Header */}
      <div className={styles.header}>
        <div>
          <h2>Unified Digital Resource Hub</h2>
          <p>Consolidated digital access for online textbooks, academic journals, and virtual student membership.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className={`${styles.tabsRow} glass`}>
        <button
          className={`${styles.tabBtn} ${activeTab === "membership" ? styles.tabActive : ""}`}
          onClick={() => {
            setActiveTab("membership");
            setSearchQuery("");
          }}
        >
          <CreditCard size={18} />
          Digital ID & Membership
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "ebooks" ? styles.tabActive : ""}`}
          onClick={() => {
            setActiveTab("ebooks");
            setSearchQuery("");
          }}
        >
          <BookOpen size={18} />
          Online E-Books
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "journals" ? styles.tabActive : ""}`}
          onClick={() => {
            setActiveTab("journals");
            setSearchQuery("");
          }}
        >
          <Globe size={18} />
          Research Journals & DOIs
        </button>

        {activeTab !== "membership" && (
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className={styles.contentArea}>
        {/* MEMBERSHIP TAB */}
        {activeTab === "membership" && user && (
          <div className={styles.membershipGrid}>
            {/* Digital ID Card Mockup */}
            <div className={styles.cardContainer}>
              <div className={`${styles.digitalIdCard} glass`}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardLogo}>
                    <BookOpen size={18} color="#fff" />
                    <span>AuraLib</span>
                  </div>
                  <span className={styles.cardBadge}>Active Member</span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.studentInfo}>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    <span className={styles.roleLabel}>{user.role}</span>
                  </div>
                  <div className={styles.qrBlock}>
                    {/* Simulated Scanner QR Code with lines */}
                    <div className={styles.barcodeScan}>
                      <div className={styles.barLine}></div>
                      <div className={styles.barLine} style={{ width: "3px" }}></div>
                      <div className={styles.barLine} style={{ width: "1px" }}></div>
                      <div className={styles.barLine} style={{ width: "4px" }}></div>
                      <div className={styles.barLine} style={{ width: "2px" }}></div>
                      <div className={styles.barLine} style={{ width: "1px" }}></div>
                      <div className={styles.barLine} style={{ width: "3px" }}></div>
                      <div className={styles.barLine} style={{ width: "2px" }}></div>
                    </div>
                    <span className={styles.barcodeText}>ID: {user.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div>
                    <span>Institution Branch</span>
                    <strong>{libraryCode}</strong>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span>Expires</span>
                    <strong>May 2027</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Membership Details */}
            <div className={`${styles.detailsWidget} glass`}>
              <h3>Unified Account Benefits</h3>
              <p className={styles.widgetDesc}>Your registration provides a singular key linking physical campus loans and electronic library assets.</p>

              <div className={styles.benefitsList}>
                <div className={styles.benefitItem}>
                  <Shield size={18} color="var(--success)" className={styles.benefitIcon} />
                  <div>
                    <h4>All-In-One Access Plan</h4>
                    <p>Access unlimited online e-books, index academic papers, and reserve up to 5 physical books.</p>
                  </div>
                </div>

                <div className={styles.benefitItem}>
                  <Shield size={18} color="var(--success)" className={styles.benefitIcon} />
                  <div>
                    <h4>Digital Barcode Scanning</h4>
                    <p>Present the digital ID card barcode directly to physical campus checkout scanner kiosks.</p>
                  </div>
                </div>

                <div className={styles.benefitItem}>
                  <Shield size={18} color="var(--success)" className={styles.benefitIcon} />
                  <div>
                    <h4>Global Institutional Roaming</h4>
                    <p>Valid across all open-source institutional deployments sharing the library system network.</p>
                  </div>
                </div>
              </div>

              <div className={styles.membershipFooter}>
                <span className={styles.tierStatus}>Current Plan: <strong>Institutional Elite Tier</strong></span>
                <button className={styles.renewBtn} onClick={() => alert("Your account is managed by your university registrar. Subscription is active.")}>
                  Verify Access Keys <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* E-BOOKS TAB */}
        {activeTab === "ebooks" && (
          <div className={styles.ebooksGrid}>
            {filteredEbooks.length === 0 ? (
              <div className={styles.emptyState}>No online e-books match your search filter.</div>
            ) : (
              filteredEbooks.map((book) => (
                <div key={book.id} className={`${styles.ebookCard} glass`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={book.coverImage} alt={book.title} className={styles.ebookCover} />
                  <div className={styles.ebookMeta}>
                    <span className={styles.ebookCat}>{book.category}</span>
                    <h4>{book.title}</h4>
                    <p>by {book.author}</p>
                    <span className={styles.ebookSize}>{book.fileSize} • {book.pagesCount} Pages</span>
                    
                    <div className={styles.ebookActions}>
                      <button className={styles.readBtn} onClick={() => handleReadBook(book)}>
                        <Eye size={14} /> Read Online
                      </button>
                      <button className={styles.downloadBtn} onClick={() => alert(`Beginning download of "${book.title}" PDF...`)}>
                        <Download size={14} /> PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* JOURNALS TAB */}
        {activeTab === "journals" && (
          <div className={styles.journalsList}>
            {filteredJournals.length === 0 ? (
              <div className={styles.emptyState}>No research journals match your search filter.</div>
            ) : (
              filteredJournals.map((journal) => (
                <div key={journal.id} className={`${styles.journalItem} glass`}>
                  <div className={styles.journalHeader}>
                    <div>
                      <h4>{journal.title}</h4>
                      <p className={styles.pubDetails}>{journal.publisher} • Released: {journal.date}</p>
                    </div>
                    <span className={styles.doiBadge}>DOI: {journal.doi}</span>
                  </div>
                  <p className={styles.journalAbstract}>
                    <strong>Abstract:</strong> {journal.abstract}
                  </p>
                  <div className={styles.journalFooter}>
                    <button className={styles.journalLinkBtn} onClick={() => alert(`Redirecting to DOI Gateway (${journal.doi}) for full index access...`)}>
                      View Full Journal Index <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* E-BOOK PDF READER MODAL SCREEN */}
      {readingBook && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.readerCard} glass animate-fade-in`}>
            {/* Reader Header */}
            <div className={styles.readerHeader}>
              <div className={styles.readerTitleBlock}>
                <BookOpen size={20} color="var(--primary)" />
                <div>
                  <h4>{readingBook.title}</h4>
                  <p>by {readingBook.author}</p>
                </div>
              </div>
              <div className={styles.readerControls}>
                <button className={styles.zoomBtn} onClick={() => setZoomLevel((z) => Math.max(z - 10, 80))}>
                  <ZoomOut size={16} />
                </button>
                <span className={styles.zoomPct}>{zoomLevel}%</span>
                <button className={styles.zoomBtn} onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}>
                  <ZoomIn size={16} />
                </button>
                <button className={styles.closeBtn} onClick={() => setReadingBook(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Reader Content Pages */}
            <div className={styles.readerBody}>
              <div 
                className={styles.pageTextContent} 
                style={{ 
                  fontSize: `${1.05 * (zoomLevel / 100)}rem`,
                  lineHeight: `${1.6 * (zoomLevel / 100)}`
                }}
              >
                <div className={styles.pageIndicatorFloating}>Page {currentPage + 1} of {readingBook.pages.length}</div>
                <h2>Chapter Content</h2>
                <hr className={styles.pageDivider} />
                <p>{readingBook.pages[currentPage]}</p>
              </div>
            </div>

            {/* Reader Footer Controls */}
            <div className={styles.readerFooter}>
              <button 
                className={styles.navPageBtn} 
                onClick={handlePrevPage} 
                disabled={currentPage === 0}
              >
                <ChevronLeft size={16} /> Previous Page
              </button>
              <span>Page {currentPage + 1} of {readingBook.pages.length}</span>
              <button 
                className={styles.navPageBtn} 
                onClick={handleNextPage} 
                disabled={currentPage === readingBook.pages.length - 1}
              >
                Next Page <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
