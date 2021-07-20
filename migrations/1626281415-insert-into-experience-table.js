const experience = [
  { id: 1, title: '<1 Year' },
  { id: 2, title: '1-3 Years' },
  { id: 3, title: '>3 Years' },
];

exports.up = async function up(sql) {
  await sql`
    INSERT INTO experience ${sql(experience, 'id', 'title')}
  `;
};

exports.down = async function down(sql) {
  for (const exp of experience) {
    await sql`
      DELETE FROM
        experience
      WHERE
        title = ${exp.title}
    `;
  }
};
