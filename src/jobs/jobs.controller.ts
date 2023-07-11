import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators';

import { GetCurrentUserId } from '../common/decorators/getCurrentUserId.decorator';
import { CreateJobRequestDto } from './dto/createJobRequest.dto';
import { JobResponseDto } from './dto/jobResponse.dto';
import { PublishJobRequestDto } from './dto/publishJobRequest.dto';
import { UpdateJobRequestDto } from './dto/updateJobRequest.dto';
import { JobsService } from './jobs.service';
import { JobsTransformer } from './jobs.transformer';

@ApiTags('jobs')
@ApiBearerAuth('accessToken')
@Roles(Role.USER, Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(
    private jobsService: JobsService,
    private readonly jobsTransformer: JobsTransformer,
  ) {}

  @ApiOperation({ summary: 'Get all jobs' })
  @ApiOkResponse({ type: JobResponseDto, isArray: true })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: JobResponseDto,
    isArray: true,
  })
  @Get()
  @ApiQuery({ name: 'role', enum: Role })
  async allJobs(): Promise<JobResponseDto[]> {
    const jobs = await this.jobsService.getAllJobs();
    return this.jobsTransformer.transformAllUsers(jobs);
  }

  @ApiOperation({ summary: 'Get all owned jobs' })
  @ApiOkResponse({ type: JobResponseDto, isArray: true })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: JobResponseDto,
    isArray: true,
  })
  @ApiQuery({ name: 'role', enum: Role })
  @Get()
  async ownedJobs(
    @GetCurrentUserId() userId: string,
  ): Promise<JobResponseDto[]> {
    const jobs = await this.jobsService.getAllOwnedJobs(userId);
    return this.jobsTransformer.transformAllUsers(jobs);
  }

  @ApiOperation({ summary: 'Get job by id' })
  @ApiOkResponse({ type: JobResponseDto })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: JobResponseDto,
  })
  @ApiQuery({ name: 'role', enum: Role })
  @Get(':id')
  async getJobById(@Param('id') jobId: string): Promise<JobResponseDto> {
    const job = await this.jobsService.getJobById(jobId);
    return this.jobsTransformer.transform(job);
  }

  @ApiOperation({ summary: 'Get all jobs by user' })
  @ApiOkResponse({ type: JobResponseDto, isArray: true })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: JobResponseDto,
    isArray: true,
  })
  @ApiQuery({ name: 'role', enum: Role })
  @Get('/:userId')
  async userJobs(@Param('userId') userId: string): Promise<JobResponseDto[]> {
    const jobs = await this.jobsService.getJobsByUserId(userId);
    return this.jobsTransformer.transformAllUsers(jobs);
  }

  @ApiOperation({ summary: 'Create a job' })
  @ApiOkResponse({ type: JobResponseDto })
  @ApiResponse({
    status: 201,
    description: 'Created',
    type: JobResponseDto,
  })
  @ApiBody({ type: CreateJobRequestDto })
  @ApiQuery({ name: 'role', enum: Role })
  @Post()
  async createJob(
    @GetCurrentUserId() userId: string,
    @Body() dto: CreateJobRequestDto,
  ): Promise<JobResponseDto> {
    const job = await this.jobsService.createJob(userId, dto);
    return this.jobsTransformer.transform(job);
  }
  @ApiOperation({ summary: 'Edit a job by id' })
  @ApiOkResponse({ type: JobResponseDto })
  @ApiResponse({
    status: 200,
    description: 'Edited',
    type: JobResponseDto,
  })
  @ApiQuery({ name: 'role', enum: Role })
  @Patch(':id')
  async updateJob(
    @Param('id') jobId: string,
    @Body() dto: UpdateJobRequestDto,
  ): Promise<JobResponseDto> {
    const job = await this.jobsService.updateJob(jobId, dto);
    return this.jobsTransformer.transform(job);
  }

  @ApiOperation({ summary: 'Publish a job by id' })
  @ApiOkResponse({ type: JobResponseDto })
  @ApiResponse({
    status: 200,
    description: 'Edited',
    type: JobResponseDto,
  })
  @ApiQuery({ name: 'role', enum: Role })
  @Patch(':id/publish')
  async publishJobs(
    @Param('id') jobId: string,
    @Body() dto: PublishJobRequestDto,
  ): Promise<JobResponseDto> {
    const job = await this.jobsService.publishJob(jobId, dto);
    return this.jobsTransformer.transform(job);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a job by id' })
  @ApiResponse({
    status: 204,
    description: 'Deleted',
  })
  @ApiQuery({ name: 'role', enum: Role })
  @Delete(':id')
  async deleteJob(@Param('id') jobId: string): Promise<void | Error> {
    return this.jobsService.deleteJob(jobId);
  }
}
