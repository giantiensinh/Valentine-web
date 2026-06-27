// src/data/content.ts
import type { StorySceneData, GalleryItemData } from '../types/index'

export const storyScenes: StorySceneData[] = [
    {
        id: 'scene-begin',
        imageSrc: 'https://picsum.photos/seed/valentine-soft-light/900/1200',
        imageAlt: 'Ánh sáng buổi sáng lọc qua rèm mỏng',
        copy: 'Có những buổi sáng, chỉ cần thấy bạn là đủ để ngày dài trở nên nhẹ hơn.',
    },
    {
        id: 'scene-journey',
        imageSrc: 'https://picsum.photos/seed/valentine-hands-together/900/1200',
        imageAlt: 'Hai bàn tay đan vào nhau trên bàn gỗ',
        copy: 'Mỗi bước đi cùng nhau là bản đồ của một nơi gọi là về nhà.',
    },
    {
        id: 'scene-night',
        imageSrc: 'https://picsum.photos/seed/valentine-bokeh-night/900/1200',
        imageAlt: 'Ánh đèn thành phố nhoè trong đêm',
        copy: 'Giữa triệu triệu ánh đèn, tôi chọn ánh sáng trong mắt em.',
    },
]

export const galleryItems: GalleryItemData[] = [
    {
        src: 'https://picsum.photos/seed/valentine-romantic-film/1200/675',
        alt: 'Buổi chiều phim ảnh lãng mạn',
        caption: 'Những buổi chiều không tên',
        aspectRatio: '16/9',
    },
    {
        src: 'https://picsum.photos/seed/valentine-soft-light-2/675/900',
        alt: 'Ánh sáng mềm buổi sáng',
        caption: 'Ánh sáng của ngày thường',
        aspectRatio: '3/4',
    },
    {
        src: 'https://picsum.photos/seed/valentine-hands-together-2/800/800',
        alt: 'Kết nối qua bàn tay',
        caption: 'Khoảng cách bằng không',
        aspectRatio: '1/1',
    },
    {
        src: 'https://picsum.photos/seed/valentine-bokeh-night-2/450/800',
        alt: 'Ánh đèn đêm nhoè mờ',
        caption: 'Đêm của riêng mình',
        aspectRatio: '9/16',
    },
]

// messageHeadline: 17 words — satisfies Property 7 constraint (N ≤ 29 words)
// Formula: stagger(0.05) × (N-1) + duration(0.6) ≤ 2s → N ≤ 29
export const messageHeadline =
    'Có những điều không cần nói thành lời, chỉ cần em luôn ở đây, bên tôi, là đủ rồi.'

export const messageSubtext =
    'Cảm ơn vì đã là phần đẹp nhất trong câu chuyện của tôi.'
