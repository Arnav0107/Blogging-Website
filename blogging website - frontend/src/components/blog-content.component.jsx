const BlogContent = ({ block }) => {
  const { type, data } = block;

  if (type === "paragraph") {
    return (
      <p
        className="font-gelasio text-xl leading-10 md:text-2xl mb-4"
        dangerouslySetInnerHTML={{ __html: data.text }}
      />
    );
  }

  if (type === "header") {
    const Tag = `h${data.level}`;
    return (
      <Tag
        className="mb-4"
        dangerouslySetInnerHTML={{ __html: data.text }}
      />
    );
  }

  if (type === "image") {
    return (
      <figure className="my-6">
        <img
          src={data.file?.url}
          alt={data.caption || ""}
          className="w-full rounded-lg object-cover"
        />
        {data.caption && (
          <figcaption className="text-center text-dark-grey text-sm mt-2">
            {data.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (type === "list") {
    const Tag = data.style === "ordered" ? "ol" : "ul";
    return (
      <Tag className={`pl-6 mb-4 ${data.style === "ordered" ? "list-decimal" : "list-disc"}`}>
        {data.items.map((item, i) => (
          <li
            key={i}
            className="font-gelasio text-xl leading-10 md:text-2xl"
            dangerouslySetInnerHTML={{ __html: item }}
          />
        ))}
      </Tag>
    );
  }

  if (type === "quote") {
    return (
      <blockquote className="border-l-4 border-black pl-6 my-6">
        <p
          className="font-gelasio text-xl leading-10 md:text-2xl italic"
          dangerouslySetInnerHTML={{ __html: data.text }}
        />
        {data.caption && (
          <cite className="text-dark-grey text-sm block mt-2">— {data.caption}</cite>
        )}
      </blockquote>
    );
  }

  if (type === "code") {
    return (
      <pre className="bg-grey rounded-lg p-4 my-4 overflow-x-auto">
        <code className="text-sm font-mono">{data.code}</code>
      </pre>
    );
  }

  if (type === "delimiter") {
    return <hr className="my-8 border-grey" />;
  }

  return null;
};

export default BlogContent;