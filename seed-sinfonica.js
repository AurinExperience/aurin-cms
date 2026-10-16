import payload from 'payload';
import dotenv from 'dotenv';

dotenv.config();

async function seedSinfonicaProject() {
  try {
    // Initialize Payload
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      mongoURL: process.env.DATABASE_URI,
      local: true,
    });

    console.log('✅ Payload initialized');

    // 1. Create or get Category
    let category = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: 'web-design',
        },
      },
    });

    if (category.docs.length === 0) {
      category = await payload.create({
        collection: 'categories',
        data: {
          name: 'Diseño Web',
          slug: 'web-design',
        },
        locale: 'es',
      });

      // Add English translation
      await payload.update({
        collection: 'categories',
        id: category.id,
        data: {
          name: 'Web Design',
        },
        locale: 'en',
      });

      console.log('✅ Category created:', category.id);
    } else {
      category = category.docs[0];
      console.log('✅ Category found:', category.id);
    }

    // 2. Create Tags
    const tagData = [
      { nameEs: 'UX/UI', nameEn: 'UX/UI', slug: 'ux-ui' },
      { nameEs: 'Desarrollo Frontend', nameEn: 'Frontend Development', slug: 'frontend' },
      { nameEs: 'Desarrollo Backend', nameEn: 'Backend Development', slug: 'backend' },
    ];

    const tags = [];
    for (const tagInfo of tagData) {
      let tag = await payload.find({
        collection: 'tags',
        where: {
          slug: {
            equals: tagInfo.slug,
          },
        },
      });

      if (tag.docs.length === 0) {
        tag = await payload.create({
          collection: 'tags',
          data: {
            name: tagInfo.nameEs,
            slug: tagInfo.slug,
          },
          locale: 'es',
        });

        // Add English translation
        await payload.update({
          collection: 'tags',
          id: tag.id,
          data: {
            name: tagInfo.nameEn,
          },
          locale: 'en',
        });

        console.log('✅ Tag created:', tag.id, '-', tagInfo.nameEs);
        tags.push(tag.id);
      } else {
        tags.push(tag.docs[0].id);
        console.log('✅ Tag found:', tag.docs[0].id);
      }
    }

    // 3. Create Project (Spanish)
    const projectDataEs = {
      title: 'Sinfónica de Minería',
      slug: 'sinfonica-mineria',
      status: 'published',
      featured: true,
      publishDate: new Date(),
      category: category.id,
      tags: tags,
      hero: {
        description: 'La Orquesta Sinfónica de Minería es una de las instituciones musicales más importantes de México, reconocida no solo por el alto nivel de sus integrantes, sino también por la calidad de sus interpretaciones. Con el paso de las décadas, la Sinfónica ha evolucionado y decidió renovar su identidad visual por una más contemporánea, sin dejar de honrar sus raíces.',
        services: [
          { name: 'UX/UI' },
          { name: 'Desarrollo front/back con integraciones' },
        ],
      },
      caseStudy: {
        title: 'Compartiendo el amor por la música',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'Este cambio trajo consigo la necesidad de alinear su presencia digital. Así nació la oportunidad de replantear la forma en que la Sinfónica interactúa con sus audiencias. Diseñamos y desarrollamos un sitio web que refleja su nuevo lenguaje visual y que, además, integra una mediateca con acceso por suscripción, una tienda en línea y un sistema de gestión de donaciones y conciertos.',
                  },
                ],
              },
            ],
          },
        },
      },
      gallery: [
        {
          alt: 'Imagen del proyecto Sinfónica de Minería',
          caption: 'Vista principal del sitio web',
        },
      ],
      learnings: {
        title: 'Cada proyecto, una historia distinta. Descúbrelas.',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'Ya viste lo que hacemos. El siguiente proyecto a mostrar en esta galería, es el tuyo.',
                  },
                ],
              },
            ],
          },
        },
      },
      client: {
        name: 'Orquesta Sinfónica de Minería',
        industry: 'Cultura y Música',
        website: 'https://osm.org.mx',
      },
      seo: {
        metaTitle: 'Proyectos Aurin: Orquesta Sinfónica de Minería',
        metaDescription: 'Realizamos el rediseño web de la Orquesta Sinfónica de Minería: música y tecnología en un mismo lugar.',
      },
    };

    // Check if project already exists
    const existingProject = await payload.find({
      collection: 'projects',
      where: {
        slug: {
          equals: 'sinfonica-mineria',
        },
      },
    });

    let project;
    if (existingProject.docs.length > 0) {
      // Update existing project
      project = await payload.update({
        collection: 'projects',
        id: existingProject.docs[0].id,
        data: projectDataEs,
        locale: 'es',
      });
      console.log('✅ Project updated (ES):', project.id);
    } else {
      // Create new project
      project = await payload.create({
        collection: 'projects',
        data: projectDataEs,
        locale: 'es',
      });
      console.log('✅ Project created (ES):', project.id);
    }

    // 4. Add English translation
    const projectDataEn = {
      title: 'Minería Symphony Orchestra',
      hero: {
        description: 'The Minería Symphony Orchestra is one of Mexico\'s most important musical institutions, known not only for the outstanding level of its musicians but also for the excellence of its performances. Over the decades, the orchestra has evolved and decided to renew its visual identity to one that feels more contemporary—without losing sight of its roots.',
        services: [
          { name: 'UX/UI Design' },
          { name: 'Front-end/back-end development with custom integrations' },
        ],
      },
      caseStudy: {
        title: 'Sharing the love for music',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'This change brought the need to realign its digital presence. That\'s when the opportunity arose to rethink how the orchestra engages with its audiences. We designed and developed a website that reflects its new visual language and includes a subscription-based media library, an online store, and an integrated system for donations and concert management.',
                  },
                ],
              },
            ],
          },
        },
      },
      gallery: [
        {
          alt: 'Minería Symphony Orchestra project image',
          caption: 'Main website view',
        },
      ],
      learnings: {
        title: 'Every project, a unique story. Explore them all.',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'You\'ve seen what we do. The next story in this gallery could be yours.',
                  },
                ],
              },
            ],
          },
        },
      },
      seo: {
        metaTitle: 'Aurin Projects: Minería Symphony Orchestra',
        metaDescription: 'We redesigned the website for the Minería Symphony Orchestra: where music and technology come together.',
      },
    };

    await payload.update({
      collection: 'projects',
      id: project.id,
      data: projectDataEn,
      locale: 'en',
    });

    console.log('✅ Project translated (EN):', project.id);
    console.log('\n🎉 ¡Proyecto Sinfónica de Minería creado exitosamente!\n');
    console.log('📝 Puedes ver el proyecto en:');
    console.log('   - Admin: http://localhost:3000/admin/collections/projects/' + project.id);
    console.log('   - Web (ES): http://localhost:4321/proyecto-payload/sinfonica-mineria');
    console.log('   - Web (EN): http://localhost:4321/en/proyecto-payload/sinfonica-mineria');
    console.log('\n⚠️  Nota: Las imágenes deben agregarse manualmente desde el admin panel.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedSinfonicaProject();
