import Desktop from "@/components/Desktop";
import { profile, projects, certifications, experience, education } from "@/content/profile";
import { publishedResearch } from "@/content/research";

/**
 * The desktop is a client-side canvas, so the real content also ships as
 * plain markup for crawlers and for anyone browsing without JavaScript.
 */
function SeoContent() {
  return (
    <div className="sr-only">
      <h1>
        {profile.name} — {profile.role}
      </h1>
      <p>{profile.tagline}</p>
      {profile.bio.map((b, i) => (
        <p key={i}>{b}</p>
      ))}
      <h2>Projects</h2>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <h3>{p.name}</h3>
            <p>{p.blurb}</p>
            <p>{p.tags.join(", ")}</p>
          </li>
        ))}
      </ul>
      <h2>Education</h2>
      <ul>
        {education.map((e) => (
          <li key={e.degree}>
            <h3>
              {e.degree} — {e.school} ({e.period})
            </h3>
            {e.detail && <p>{e.detail}</p>}
          </li>
        ))}
      </ul>
      <h2>Certifications</h2>
      <ul>
        {certifications.map((c) => (
          <li key={c.name}>
            {c.name} — {c.issuer} ({c.status})
          </li>
        ))}
      </ul>
      <h2>Experience</h2>
      <ul>
        {experience.map((j) => (
          <li key={j.role + j.company}>
            <h3>
              {j.role} — {j.company} ({j.period})
            </h3>
            <ul>
              {j.points.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <h2>Research</h2>
      <ul>
        {publishedResearch().map((n) => (
          <li key={n.slug}>
            <h3>{n.title}</h3>
            <p>{n.summary}</p>
          </li>
        ))}
      </ul>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </p>
      <ul>
        {profile.socials.map((s) => (
          <li key={s.label}>
            <a href={s.url}>{s.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SeoContent />
      <Desktop />
    </>
  );
}
