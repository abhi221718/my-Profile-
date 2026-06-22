import { useEffect, useState } from 'react'
import bbImage from '../../img/bb.jpg'
import './App.css'

const services = [
  {
    title: 'Web Development',
    description:
      'Creating modern, responsive websites that look great and perform smoothly.',
  },
  {
    title: 'UI/UX Design',
    description:
      'Designing simple, attractive interfaces that make user interaction effortless.',
  },
  {
    title: 'Data Analysis',
    description:
      'Turning raw data into useful insights through clear reporting and smart analysis.',
  },
  {
    title: 'Brand Building',
    description:
      'Helping businesses improve their online presence with smart design and strategy.',
  },
]

const skills = [
  'HTML & CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Git & GitHub',
  'Responsive Design',
  'GitHub Projects',
]

const projects = [
  {
    name: 'Portfolio Website',
    type: 'GitHub Project',
    description:
      'A complete personal portfolio website built with React and deployed for showcasing my work.',
    link: 'https://github.com/',
  },
  {
    name: 'Business Landing Page',
    type: 'GitHub Project',
    description:
      'A clean landing page created for business presentation, branding, and lead generation.',
    link: 'https://github.com/',
  },
  {
    name: 'Web UI Components',
    type: 'GitHub Project',
    description:
      'Reusable UI components and layout ideas designed for modern web interfaces.',
    link: 'https://github.com/',
  },
]

function App() {
  const [theme, setTheme] = useState('light')
  const [isEntered, setIsEntered] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme')
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [])

  useEffect(() => {
    document.body.dataset.theme = theme
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  const handleSubmit = (event) => {
    event.preventDefault()

    const { name, email, message } = formData
    const subject = `Portfolio Contact from ${name || 'Visitor'}`
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      message,
    ].join('\n')

    const mailtoLink = `mailto:sharmaabhishek52272@gmail.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`

    window.location.href = mailtoLink
    setSubmitMessage('Your message is ready to send. Please confirm in your email app.')
    setFormData({ name: '', email: '', message: '' })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className={`portfolio ${theme}`}>
      {!isEntered ? (
        <section className="landing-screen">
          <button
            className="landing-card"
            onClick={() => setIsEntered(true)}
            aria-label="Open portfolio website"
          >
            <img src={bbImage} alt="Abhishek Sharma" className="landing-image" />
            <span className="landing-label">Open Portfolio</span>
          </button>
        </section>
      ) : (
        <>
          <header className="navbar">
            <a href="#home" className="logo">
              Abhi<span>.</span>
            </a>
            <nav>
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#skills">Skills</a>
              <a href="#projects">Projects</a>
              <a href="#contact">Contact</a>
            </nav>
            <button
              className="theme-toggle"
              onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </header>

          <main>
            <section className="hero" id="home">
              <div className="hero-text">
                <p className="eyebrow">Hi, I am</p>
                <h1>Abhishek Sharma</h1>
                <h2>Developer & Creative Thinker</h2>
                <p className="hero-description">
                  I create web experiences that combine clean design, modern technology,
                  and practical business value.
                </p>
                <div className="hero-actions">
                  <a href="#contact" className="btn btn-primary">
                    Contact Me
                  </a>
                  <a href="#projects" className="btn btn-secondary">
                    View Projects
                  </a>
                </div>
              </div>
              <div className="hero-image-wrap">
                <div className="hero-image-card">
                  <img
                    src={bbImage}
                    alt="Abhishek Sharma"
                    className="hero-image"
                  />
                </div>
              </div>
            </section>

            <section className="about" id="about">
              <div className="section-heading">
                <p className="section-tag">My Intro</p>
                <h3>About Me</h3>
              </div>
              <div className="about-content">
                <p className="about-text">
                  I’m a passionate web developer who enjoys turning ideas into user-friendly
                  digital products. My goal is to build websites that are not only visually
                  appealing but also fast, functional, and meaningful.
                </p>
                <div className="about-card">
                  <span>01</span>
                  <p>Focused on quality, detail, and clean code.</p>
                </div>
              </div>
              <div className="stats">
                <div>
                  <strong>3+</strong>
                  <span>Years Experience</span>
                </div>
                <div>
                  <strong>20+</strong>
                  <span>Projects Completed</span>
                </div>
                <div>
                  <strong>15+</strong>
                  <span>Happy Clients</span>
                </div>
              </div>
            </section>

            <section className="services" id="skills">
              <div className="section-heading">
                <p className="section-tag">Skills</p>
                <h3>What I Use</h3>
              </div>
              <div className="skill-grid">
                {skills.map((skill) => (
                  <span className="skill-pill" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section className="services" id="services">
              <div className="section-heading">
                <p className="section-tag">What I Do</p>
                <h3>Services</h3>
              </div>
              <div className="service-cards">
                {services.map((service) => (
                  <article className="service-card" key={service.title}>
                    <h4>{service.title}</h4>
                    <p>{service.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="projects" id="projects">
              <div className="section-heading">
                <p className="section-tag">GitHub Work</p>
                <h3>My Projects</h3>
              </div>
              <div className="project-cards">
                {projects.map((project) => (
                  <article className="project-card" key={project.name}>
                    <p className="project-type">{project.type}</p>
                    <h4>{project.name}</h4>
                    <p>{project.description}</p>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="project-link"
                    >
                      View on GitHub
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section className="contact" id="contact">
              <div className="section-heading">
                <p className="section-tag">Get In Touch</p>
                <h3>Contact Me</h3>
              </div>
              <div className="contact-wrap">
                <div className="contact-info">
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:sharmaabhishek52272@gmail.com">sharmaabhishek52272@gmail.com</a>
                  </p>
                  <p>
                    <strong>Phone:</strong>{' '}
                    <a href="tel:+919839503774">+91 9839503774</a>
                  </p>
                  <p>
                    <strong>Instagram:</strong>{' '}
                    <a href="https://instagram.com" target="_blank" rel="noreferrer">
                      @abhishek_sharma
                    </a>
                  </p>
                  <p>
                    <strong>GitHub:</strong>{' '}
                    <a href="https://github.com" target="_blank" rel="noreferrer">
                      github.com
                    </a>
                  </p>
                </div>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <textarea
                    name="message"
                    rows="5"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                  <button type="submit">Send Message</button>
                  {submitMessage && <p className="submit-message">{submitMessage}</p>}
                </form>
              </div>
            </section>
          </main>
        </>
      )}
    </div>
  )
}

export default App
