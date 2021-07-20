const regions = [
  { id: 1, title: 'Bretagne' },
  { id: 2, title: 'Centre-Val-De-Loire' },
  { id: 3, title: 'Hauts-De-France' },
  { id: 4, title: 'Normandie' },
  { id: 5, title: 'Okzitanien' },
];

exports.up = async function up(sql) {
  await sql`
    INSERT INTO regions ${sql(regions, 'id', 'title')}
  `;
};

exports.down = async function down(sql) {
  for (const region of regions) {
    await sql`
      DELETE FROM
        regions
      WHERE
        title = ${region.title}
    `;
  }
};
