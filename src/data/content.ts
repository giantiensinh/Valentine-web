// src/data/content.ts
import type { StorySceneData, GalleryItemData } from '../types/index'

export const storyScenes: StorySceneData[] = [
    {
        id: 'scene-begin',
        imageSrc: '',
        imageAlt: 'Ánh sáng buổi sáng lọc qua rèm mỏng',
        copy: 'Có những buổi sáng, chỉ cần thấy bạn là đủ để ngày dài trở nên nhẹ hơn.',
    },
    {
        id: 'scene-journey',
        imageSrc: '',
        imageAlt: 'Hai bàn tay đan vào nhau trên bàn gỗ',
        copy: 'Mỗi bước đi cùng nhau là bản đồ của một nơi gọi là về nhà.',
    },
    {
        id: 'scene-night',
        imageSrc: '',
        imageAlt: 'Ánh đèn thành phố nhoè trong đêm',
        copy: 'Giữa triệu triệu ánh đèn, tôi chọn ánh sáng trong mắt em.',
    },
]

export const galleryItems: GalleryItemData[] = [
    {
        src: '',
        alt: '',
        caption: 'Những khoảnh khắc đầu tiên',
        aspectRatio: '3/4',
        icon: '♥',
        color: 'hsl(350, 65%, 45%)',
    },
    {
        src: '',
        alt: '',
        caption: 'Mỗi ngày có em là một ngày đẹp',
        aspectRatio: '1/1',
        icon: '✨',
        color: 'hsl(48, 70%, 60%)',
    },
    {
        src: '',
        alt: '',
        caption: 'Cảm ơn vì luôn ở đây',
        aspectRatio: '9/16',
        icon: '🌸',
        color: 'hsl(320, 55%, 60%)',
    },
    {
        src: '',
        alt: '',
        caption: 'Em là điều tốt nhất đã xảy ra',
        aspectRatio: '16/9',
        icon: '❤',
        color: 'hsl(0, 65%, 55%)',
    },
]

// messageHeadline: 17 words — satisfies Property 7 constraint (N ≤ 29 words)
// Formula: stagger(0.05) × (N-1) + duration(0.6) ≤ 2s → N ≤ 29
export const messageHeadline =
    'Có những điều không cần nói thành lời, chỉ cần em luôn ở đây, bên tôi, là đủ rồi.'

export const messageSubtext =
    'Cảm ơn vì đã là phần đẹp nhất trong câu chuyện của tôi.'
