import { SidebarLeft } from '@/components/sidebar-left'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<SidebarProvider>
			<SidebarLeft />
			<SidebarInset>
				<header className='sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-background'>
					<div className='flex flex-1 items-center gap-2 px-3'>
						<SidebarTrigger />
						<Separator orientation='vertical' className='mr-2 h-4' />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbPage className='line-clamp-1'>
										Dashboard
									</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div>{children}</div>
				{/* <div className='flex flex-1 flex-col gap-4 p-8'>{children}</div> */}
			</SidebarInset>
			{/* <SidebarRight /> */}
		</SidebarProvider>
	)
}
